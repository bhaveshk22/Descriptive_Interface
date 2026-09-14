export function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export function countWords(text) {
  const trimmed = text.trim();
  return trimmed === "" ? 0 : trimmed.split(/\s+/).length;
}

// Key names that count as "navigation shortcuts" and are blocked outright,
// with or without modifiers — Home/End/PageUp/PageDown jump the cursor in a
// way no mouse-free, combo-free exam portal would allow.
export const BLOCKED_NAV_KEYS = ["Home", "End", "PageUp", "PageDown"];
