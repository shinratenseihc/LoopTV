// Le marqueur entier doit correspondre exactement, sans URL ni caractères supplémentaires.
export const MARKER_PATTERN = /^\[(?:ltv|gifrift):([a-z0-9_-]{1,40})\]$/;

export function parseMarker(value) {
  if (typeof value !== "string") return null;
  return MARKER_PATTERN.exec(value)?.[1] ?? null;
}
