import { moment } from "obsidian";

import type { Duration, Moment } from "moment";

export function parseDateTime(dateTime: string, format: string): Moment {
  // @ts-expect-error: In obsidian.d.ts, Moment is namespace imported instead of default imported.
  const dateTimeParsed = moment(dateTime, format, true);

  if (!dateTimeParsed.isValid()) {
    throw new Error(
      "Invalid date-time format. Expected format: " + format + "."
    );
  }

  return dateTimeParsed;
}

export function parseTime(time: string): Moment {
  // @ts-expect-error: In obsidian.d.ts, Moment is namespace imported instead of default imported.
  const timeParsed = moment(time, "HH:mm");

  if (!timeParsed.isValid()) {
    throw new Error("Invalid time string. Expected format: HH:mm.");
  }

  return timeParsed;
}

export function parseDuration(duration: string): Duration {
  // Check if the duration is in the format "HH:mm"
  if (!/^\d{1,2}:\d{1,2}$/.test(duration)) {
    throw new Error("Invalid duration string. Expected format: HH:mm.");
  }
  const durationParsed = moment.duration(duration);
  return durationParsed;
}
