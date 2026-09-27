import type { Rejection } from "./types.js";

/** A permanent input problem. Throwing this completes the queue job without retrying it. */
export class MediaRejectedError extends Error {
  readonly rejection: Rejection;

  constructor(
    code: string,
    message: string,
    details?: Readonly<Record<string, unknown>>,
  ) {
    super(message);
    this.name = "MediaRejectedError";
    this.rejection =
      details === undefined ? { code, message } : { code, message, details };
  }
}

export function asError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value));
}
