export const DEFAULT_IMAGE_WIDTHS = [400, 800, 1600, 2400] as const;

/** Select fixed rungs below the source and append its capped exact width. */
export function widthsForSource(
  sourceWidth: number,
  configured: readonly number[],
): number[] {
  if (!Number.isFinite(sourceWidth) || sourceWidth <= 0) {
    throw new Error(`sourceWidth must be positive, received ${sourceWidth}.`);
  }
  if (configured.length === 0)
    throw new Error("At least one rendition width is required.");
  const widths = [...new Set(configured.map(Math.round))].sort((a, b) => a - b);
  if (widths.some((width) => !Number.isFinite(width) || width <= 0)) {
    throw new Error("Every rendition width must be a positive finite number.");
  }
  const ceiling = widths.at(-1)!;
  const cap = Math.min(Math.round(sourceWidth), ceiling);
  return [...widths.filter((width) => width < cap), cap];
}
