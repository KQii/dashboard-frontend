/**
 * Utility functions for DateTimePicker component
 */

export interface DateTimeRange {
  start: { date: Date | null; time: { hour: number; minute: number } };
  end: { date: Date | null; time: { hour: number; minute: number } };
}

export interface ISODateTimeRange {
  startsAt: string;
  endsAt: string;
}

/**
 * Converts DateTimePicker value to ISO string format for API calls
 * @param value - The DateTimePicker value
 * @returns Object with startsAt and endsAt in ISO format, or empty object if no date selected
 */
export function dateTimeRangeToISO(
  value: DateTimeRange
): ISODateTimeRange | Record<string, never> {
  if (!value.start.date) return {};

  // Create start date with time
  const startDate = new Date(value.start.date);
  startDate.setHours(value.start.time.hour, value.start.time.minute, 0, 0);

  // Use end date if selected, otherwise use start date
  const endDate = new Date(value.end.date || value.start.date);
  endDate.setHours(value.end.time.hour, value.end.time.minute, 0, 0);

  return {
    startsAt: startDate.toISOString(),
    endsAt: endDate.toISOString(),
  };
}

/**
 * Converts ISO string dates to DateTimePicker format
 * @param startsAt - ISO string for start date/time
 * @param endsAt - ISO string for end date/time
 * @returns DateTimeRange object for DateTimePicker
 */
export function isoToDateTimeRange(
  startsAt: string,
  endsAt: string
): DateTimeRange {
  const startDate = new Date(startsAt);
  const endDate = new Date(endsAt);

  return {
    start: {
      date: startDate,
      time: {
        hour: startDate.getHours(),
        minute: startDate.getMinutes(),
      },
    },
    end: {
      date: endDate,
      time: {
        hour: endDate.getHours(),
        minute: endDate.getMinutes(),
      },
    },
  };
}

/**
 * Creates a transform function for use with Table FilterConfig
 * Converts DateTimePicker value to API query parameters
 */
export const createDateTimeRangeTransform = (field: string) => {
  return (value: DateTimeRange): Record<string, string | string[]> => {
    const isoRange = dateTimeRangeToISO(value);

    if (Object.keys(isoRange).length === 0) return {};

    // For single field filter, return both gte and lte
    return {
      [field]: [`gte:${isoRange.startsAt}`, `lte:${isoRange.endsAt}`],
    };
  };
};
