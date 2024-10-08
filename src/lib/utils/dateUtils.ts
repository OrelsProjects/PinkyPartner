import {
  getEndOfTheWeekDate,
  getStartOfTheWeekDate,
} from "../../app/api/obligation/_utils";

export const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/**
 * Converts a numeric day (0-6) into a string representing the day of the week.
 * @param dayNumber The day number (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
 * @returns The name of the day.
 */
export function dayNumberToName(dayNumber: number): string {
  return daysOfWeek[dayNumber];
}

export function dayNameToNumber(dayName: string): number {
  return daysOfWeek.findIndex(
    day => day.toLowerCase() === dayName.toLowerCase(),
  );
}

/**
 * Converts an array of day numbers into an array of day names.
 * @param dayNumbers Array of day numbers (0-6).
 * @returns Array of day names.
 */
export function dayNumbersToNames(dayNumbers: number[]): string[] {
  return dayNumbers.map(dayNumberToName);
}

export function getNextWeekDate(): Date {
  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getUTCDate() + 7);
  return nextWeek;
}

export function getDateInThreeMonths(): Date {
  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setMonth(now.getUTCMonth() + 3);
  return nextWeek;
}

export function dateToHourMinute(date: Date): string {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Return sunday/monday/.../saturday based on the date
 * @param date
 * @returns
 */
export function dateToDayString(date: Date): string {
  const safeDate = new Date(date);
  return dayNumberToName(safeDate.getUTCDay());
}

export function DaysToText(days?: number[]): string {
  if (!days || days.length === 0) {
    return "Never";
  }
  return days.map(day => dayNumberToName(day).slice(0, 2)).join(", ");
}

export const isDateSameDay = (day: string, date: Date) => {
  const safeDate = new Date(date);
  const dayNumber = dayNameToNumber(day);
  const dayUTC = safeDate.getUTCDay();
  return dayUTC === dayNumber;
};

export const dayToThisWeekDate = (day: string): Date => {
  const dayNumber = dayNameToNumber(day);
  const now = new Date();
  const dayUTC = now.getUTCDay();
  const diff = dayNumber - dayUTC;
  now.setDate(now.getUTCDate() + diff);
  return now;
};

export const getWeekRangeFormatted = (): string => {
  const startWeekDate = getStartOfTheWeekDate(true);
  const endWeekDate = getEndOfTheWeekDate();
  const startOfWeekDay = startWeekDate.getDate();
  const startOfWeekMonth = startWeekDate.getMonth() + 1;
  const endOfWeekDay = endWeekDate.getDate();
  const endOfWeekMonth = endWeekDate.getMonth() + 1;
  return startOfWeekMonth !== endOfWeekMonth
    ? `${startOfWeekDay}/${startOfWeekMonth} - ${endOfWeekDay}/${endOfWeekMonth}`
    : `${startOfWeekDay} - ${endOfWeekDay}/${endOfWeekMonth}`;
};

export const getDateFormatted = (
  day: string,
  dayShortened?: boolean,
): string => {
  // dddddd or ddd, mm MMM(3 letters month)
  const date = dayToThisWeekDate(day);
  const month = date.getUTCDate() + 1;
  const monthName = date.toLocaleString("default", { month: "short" });
  return dayShortened ? `${day} ${monthName}` : `${day}, ${month} ${monthName}`;
};
