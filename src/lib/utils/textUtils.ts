export function timesAWeekToText(timesAWeek?: number | null) {
  if (!timesAWeek) return "";
  if (timesAWeek === 0) return "Never";
  if (timesAWeek === 1) return "Once a week";
  return `${timesAWeek} times a week`;
}
