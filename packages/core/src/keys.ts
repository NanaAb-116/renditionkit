import type { RenditionKeyBuilder } from "./types.js";

function segment(value: string): string {
  const encoded = encodeURIComponent(value).replaceAll("%", "_");
  // `.` and `..` survive encodeURIComponent and are traversal segments for a
  // filesystem-backed adapter. Object stores treat them literally, but the
  // default must be safe for every adapter promised by the core contract.
  if (encoded === ".") return "_2E";
  if (encoded === "..") return "_2E_2E";
  return encoded;
}

/**
 * Default immutable key layout. Namespace and media type prevent unrelated apps
 * or engines from colliding when they share a bucket.
 */
export const defaultRenditionKey: RenditionKeyBuilder = (
  asset,
  engine,
  output,
) => {
  const namespace = segment(
    asset.namespace?.trim() ? asset.namespace : "default",
  );
  return [
    "renditions",
    namespace,
    segment(asset.mediaType),
    segment(asset.id),
    `v${engine.renditionVersion}`,
    `${segment(output.name)}.${segment(output.extension)}`,
  ].join("/");
};
