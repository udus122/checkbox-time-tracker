import moment from "moment";

import type { Duration, Moment } from "moment";

export function parseTime(time: string): Moment {
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
