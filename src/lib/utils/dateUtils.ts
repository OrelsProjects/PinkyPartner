/**
 * Converts a numeric day (0-6) into a string representing the day of the week.
 * @param dayNumber The day number (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
 * @returns The name of the day.
 */
export function dayNumberToName(dayNumber: number): string {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return dayNames[dayNumber];
  }
  
  /**
   * Converts an array of day numbers into an array of day names.
   * @param dayNumbers Array of day numbers (0-6).
   * @returns Array of day names.
   */
  export function dayNumbersToNames(dayNumbers: number[]): string[] {
    return dayNumbers.map(dayNumberToName);
  }
  