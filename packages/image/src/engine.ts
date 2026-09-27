import { createHash } from "node:crypto";
import sharp, { type Sharp } from "sharp";
import { rgbaToThumbHash } from "thumbhash";
import {
  MediaRejectedError,
  type EmitRendition,
  type MediaAsset,
  type MediaEngine,
  type MediaInspection,
  type TransformResult,
} from "@renditionkit/core";
import { DEFAULT_IMAGE_WIDTHS, widthsForSource } from "./ladder.js";
import { sniffImageContentType } from "./sniff.js";

export type ImageRenditionFormat = "avif" | "webp" | "jpeg";

export interface ImageEngineOptions {
  widths?: readonly number[];
  formats?: readonly ImageRenditionFormat[];
  renditionVersion?: number;
  maxInputPixels?: number;
  validationWidth?: number;
  /** Animated sources are rejected by default rather than silently losing frames. */
  animated?: "reject" | "first-frame";
  generateThumbhash?: boolean;
  /** Global libvips concurrency. Defaults to one thread per operation. */
  sharpConcurrency?: number;
  quality?: Partial<Record<ImageRenditionFormat, number>>;
}

export interface ImageInspectionMetadata extends Record<string, unknown> {
  format: string | null;
  orientation: number | null;
  pages: number;
  animated: boolean;
}

export interface ImageTransformMetadata extends Record<string, unknown> {
  thumbhash?: string;
  variants: Partial<Record<ImageRenditionFormat, number[]>>;
}

const DEFAULT_MAX_INPUT_PIXELS = 268_402_689;

function bufferOf(input: Uint8Array): Buffer {
  return Buffer.from(input.buffer, input.byteOffset, input.byteLength);
}

function positiveInteger(value: number, label: string): number {
  if (!Number.isInteger(value) || value < 1)
    throw new Error(`${label} must be a positive integer.`);
  return value;
}

function dimensionsOf(inspection: MediaInspection): {
  width: number;
  height: number;
} {
  if (!inspection.width || !inspection.height) {
    throw new MediaRejectedError(
      "missing_dimensions",
      "The image has no readable dimensions.",
    );
  }
  return { width: inspection.width, height: inspection.height };
}

async function thumbhashOf(source: {
  data: Buffer;
  width: number;
  height: number;
  channels: number;
}): Promise<string> {
  const { data, info } = await sharp(source.data, {
    raw: {
      width: source.width,
      height: source.height,
      channels: source.channels as 1 | 2 | 3 | 4,
    },
  })
    .resize(100, 100, { fit: "inside", withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return Buffer.from(rgbaToThumbHash(info.width, info.height, data)).toString(
    "base64",
  );
}

function encode(
  pipeline: Sharp,
  format: ImageRenditionFormat,
  quality: number,
): Promise<{ data: Buffer; info: sharp.OutputInfo }> {
  switch (format) {
    case "avif":
      return pipeline
        .avif({ quality, effort: 4, chromaSubsampling: "4:4:4" })
        .toBuffer({ resolveWithObject: true });
    case "webp":
      return pipeline
        .webp({ quality, effort: 5, smartSubsample: true })
        .toBuffer({ resolveWithObject: true });
    case "jpeg":
      return pipeline
        .jpeg({ quality, chromaSubsampling: "4:4:4", mozjpeg: true })
        .toBuffer({ resolveWithObject: true });
  }
}

/** Create a bounded, orientation-aware, colour-managed Sharp image engine. */
export function createImageEngine(
  options: ImageEngineOptions = {},
): MediaEngine {
  const widths = options.widths ?? DEFAULT_IMAGE_WIDTHS;
  // Validate once at construction instead of during a queue job.
  widthsForSource(widths.at(-1) ?? 0, widths);
  const formats = [...new Set(options.formats ?? (["avif", "webp"] as const))];
  if (formats.length === 0)
    throw new Error("At least one output format is required.");
  const maxInputPixels = positiveInteger(
    options.maxInputPixels ?? DEFAULT_MAX_INPUT_PIXELS,
    "maxInputPixels",
  );
  const validationWidth = positiveInteger(
    options.validationWidth ?? 32,
    "validationWidth",
  );
  const version = positiveInteger(
    options.renditionVersion ?? 1,
    "renditionVersion",
  );
  const animated = options.animated ?? "reject";
  const shouldGenerateThumbhash = options.generateThumbhash ?? true;
  sharp.concurrency(options.sharpConcurrency ?? 1);

  const quality: Record<ImageRenditionFormat, number> = {
    avif: options.quality?.avif ?? 52,
    webp: options.quality?.webp ?? 80,
    jpeg: options.quality?.jpeg ?? 80,
  };
  for (const [format, value] of Object.entries(quality)) {
    if (!Number.isInteger(value) || value < 1 || value > 100) {
      throw new Error(`quality.${format} must be an integer from 1 to 100.`);
    }
  }

  const buffered = {
    mediaType: "image",
    renditionVersion: version,

    async inspect(
      input: Uint8Array,
      _asset: MediaAsset,
    ): Promise<MediaInspection> {
      const contentType = sniffImageContentType(input);
      if (!contentType) {
        throw new MediaRejectedError(
          "unsupported_type",
          "The source is not a supported JPEG, PNG, GIF, WebP, or AVIF image.",
        );
      }

      const bytes = bufferOf(input);
      try {
        await sharp(bytes, {
          failOn: "truncated",
          limitInputPixels: maxInputPixels,
        })
          .resize({ width: validationWidth, fit: "inside" })
          .toBuffer();
      } catch (error) {
        throw new MediaRejectedError(
          "invalid_image",
          (error as Error).message.split("\n")[0]!,
        );
      }

      const metadata = await sharp(bytes, {
        failOn: "truncated",
        limitInputPixels: maxInputPixels,
      }).metadata();
      const oriented = metadata.autoOrient ?? {
        width: metadata.width,
        height: metadata.height,
      };
      if (!oriented.width || !oriented.height) {
        throw new MediaRejectedError(
          "missing_dimensions",
          "The image has no readable dimensions.",
        );
      }
      const pages = metadata.pages ?? 1;
      if (pages > 1 && animated === "reject") {
        throw new MediaRejectedError(
          "animated_image_unsupported",
          "Animated images are not enabled for this worker.",
          { pages },
        );
      }
      const details: ImageInspectionMetadata = {
        format: metadata.format ?? null,
        orientation: metadata.orientation ?? null,
        pages,
        animated: pages > 1,
      };
      return {
        contentType,
        width: oriented.width,
        height: oriented.height,
        metadata: details,
      };
    },

    async transform(
      input: Uint8Array,
      inspection: MediaInspection,
      emit: EmitRendition,
    ): Promise<TransformResult> {
      const sourceDimensions = dimensionsOf(inspection);
      const selectedWidths = widthsForSource(sourceDimensions.width, widths);
      const widest = selectedWidths.at(-1)!;
      const { data, info } = await sharp(bufferOf(input), {
        failOn: "truncated",
        limitInputPixels: maxInputPixels,
        page: 0,
      })
        .rotate()
        .resize({
          width: widest,
          withoutEnlargement: true,
          kernel: sharp.kernel.lanczos3,
          fit: "inside",
        })
        .toColourspace("srgb")
        .raw()
        .toBuffer({ resolveWithObject: true });

      const decoded = {
        data,
        width: info.width,
        height: info.height,
        channels: info.channels,
      };
      const variants = Object.fromEntries(
        formats.map((format) => [format, [] as number[]]),
      ) as Partial<Record<ImageRenditionFormat, number[]>>;
      const thumbhash = shouldGenerateThumbhash
        ? await thumbhashOf(decoded)
        : undefined;

      for (const width of selectedWidths) {
        for (const format of formats) {
          const pipeline = sharp(decoded.data, {
            raw: {
              width: decoded.width,
              height: decoded.height,
              channels: decoded.channels as 1 | 2 | 3 | 4,
            },
          })
            .resize({
              width,
              withoutEnlargement: true,
              kernel: sharp.kernel.lanczos3,
              fit: "inside",
            })
            .sharpen({ sigma: width >= 2400 ? 0.5 : 0.7, m1: 0.4, m2: 2 })
            .withIccProfile("srgb");
          const output = await encode(pipeline, format, quality[format]);
          await emit({
            name: `w${output.info.width}`,
            extension: format === "jpeg" ? "jpg" : format,
            contentType: `image/${format}`,
            body: output.data,
            width: output.info.width,
            height: output.info.height,
            metadata: { requestedWidth: width },
          });
          variants[format]!.push(output.info.width);
        }
      }

      const metadata: ImageTransformMetadata = {
        variants,
        ...(thumbhash === undefined ? {} : { thumbhash }),
      };
      return { metadata };
    },
  };

  return {
    mediaType: "image",
    renditionVersion: version,
    async prepare(asset, source) {
      const original = await source.read();
      const inspection = await buffered.inspect(original.body, asset);
      const input = bufferOf(original.body);
      return {
        checksum: createHash("sha256").update(input).digest("hex"),
        sourceBytes: input.byteLength,
        inspection,
        transform: (emit) => buffered.transform(input, inspection, emit),
      };
    },
  };
}
