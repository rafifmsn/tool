/**
 * Format milliseconds to HH:MM:SS string.
 */
export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(":");
}

/**
 * Format milliseconds to "+HH:MM:SS" string for split differentials.
 */
export function formatDiff(ms: number): string {
  return "+" + formatTime(ms);
}
