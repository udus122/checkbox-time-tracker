import moment from "moment";

import { parseDuration, parseTime } from "./utils";

describe("parseTime", () => {
  it("12:30 (valid)", () => {
    const timeString = "12:30";
    const expectedTime = moment("12:30", "HH:mm");

    const parsedTime = parseTime(timeString);

    expect(parsedTime).toEqual(expectedTime);
  });

  it("invalid", () => {
    const timeString = "invalidTime";
    expect(() => parseTime(timeString)).toThrow(
      "Invalid time string. Expected format: HH:mm."
    );
  });
});

describe("parseDuration", () => {
  it("1:00 (valid)", () => {
    const durationString = "1:00";
    const expectedDuration = moment.duration(1, "hour");

    const parsedDuration = parseDuration(durationString);

    expect(parsedDuration).toEqual(expectedDuration);
  });

  it("01:00 (valid)", () => {
    const durationString = "01:00";
    const expectedDuration = moment.duration(1, "hour");

    const parsedDuration = parseDuration(durationString);

    expect(parsedDuration).toEqual(expectedDuration);
  });

  it("invalid", () => {
    const durationString = "invalidDuration";
    expect(() => parseDuration(durationString)).toThrow(
      "Invalid duration string. Expected format: HH:mm."
    );
  });
});
