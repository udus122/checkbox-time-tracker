import type { Duration, Moment } from "moment";
import { Status } from "./Status";
import { parseDuration, parseTime } from "./utils";

export type TimeInput = { time?: Moment; estimation?: Moment };
export type DurationInput = { time?: Duration; estimation?: Duration };

export class TaskInput {
  /** Match the indentation at the beginning of a line */
  static readonly INDENTATION_REGEX = /^(?<indentation>[\s\t]*)/;

  /** Matches - * and + list markers, or numbered list markers (eg 1.) */
  static readonly LIST_MARKER_REGEX = /(?<listMarker>[-*+])/;

  /** Matches a checkbox and saves the status character inside */
  static readonly CHECKBOX_MARKER_REGEX = /\[(?<statusSymbol>.)\]/u;

  /** Matches the rest of the task after the checkbox. */
  static readonly CHECKBOX_BODY_REGEX = / *(?<body>.*)/u;

  /**
   * Main regex for parsing a line. It matches the following:
   * - Indentation
   * - List marker
   * - Status character
   * - Body(Rest of task after checkbox markdown)
   */
  static readonly CHECKBOX_REGEX = new RegExp(
    TaskInput.INDENTATION_REGEX.source +
      TaskInput.LIST_MARKER_REGEX.source +
      " +" +
      TaskInput.CHECKBOX_MARKER_REGEX.source +
      TaskInput.CHECKBOX_BODY_REGEX.source,
    "u"
  );

  public readonly indentation: string;
  public readonly listMarker: string;
  public readonly statusSymbol: string;
  public readonly status: Status;
  public readonly start: TimeInput | null;
  public readonly end: TimeInput | null;
  public readonly duration: DurationInput | null;
  public readonly content: string;

  constructor({
    indentation,
    listMarker,
    statusSymbol,
    status,
    start,
    end,
    duration,
    content,
  }: {
    indentation: string;
    listMarker: string;
    statusSymbol: string;
    status: Status;
    start: TimeInput | null;
    end: TimeInput | null;
    duration: DurationInput | null;
    content: string;
  }) {
    this.indentation = indentation;
    this.listMarker = listMarker;
    this.statusSymbol = statusSymbol;
    this.status = status;
    this.start = start;
    this.end = end;
    this.duration = duration;
    this.content = content;
  }

  public static fromLine(line: string): TaskInput {
    const {
      indentation,
      listMarker,
      statusSymbol,
      body: checkboxBody,
    } = TaskInput.splitCheckbox(line);

    const status = Status.fromSymbol(statusSymbol);

    const { start, end, duration, content } =
      TaskInput.parseCheckboxBody(checkboxBody);

    return new TaskInput({
      indentation,
      listMarker,
      statusSymbol,
      status,
      start,
      end,
      duration,
      content,
    });
  }

  static parseCheckboxComponents(line: string): {
    indentation: string;
    listMarker: string;
    statusSymbol: string;
    status: Status;
    body: string;
  } {
    const { indentation, listMarker, statusSymbol, body } =
      TaskInput.splitCheckbox(line);

    const status = Status.fromSymbol(statusSymbol);

    return {
      indentation,
      listMarker,
      statusSymbol,
      status,
      body,
    };
  }

  static splitCheckbox(line: string): {
    indentation: string;
    listMarker: string;
    statusSymbol: string;
    body: string;
  } {
    const regexMatch = line.match(TaskInput.CHECKBOX_REGEX);

    if (regexMatch === null) {
      throw new Error("Line does not match task regex");
    }

    const { indentation, listMarker, statusSymbol, body } =
      regexMatch.groups ?? {};

    return { indentation, listMarker, statusSymbol, body };
  }

  static parseCheckboxBody(body: string): {
    start: TimeInput | null;
    end: TimeInput | null;
    duration: DurationInput | null;
    content: string;
  } {
    const bodyArray = body.split(",");

    const startInput = TaskInput.parseTaskTimeInput(bodyArray[0]);
    if (startInput === null) {
      return {
        start: null,
        end: null,
        duration: null,
        content: bodyArray.join(","),
      };
    }

    const start = {
      time: startInput.time ? parseTime(startInput.time) : undefined,
      estimation: startInput.estimation
        ? parseTime(startInput.estimation)
        : undefined,
    };

    const endInput = TaskInput.parseTaskTimeInput(bodyArray[1]);
    if (endInput === null) {
      return {
        start,
        end: null,
        duration: null,
        content: bodyArray.slice(1).join(","),
      };
    }

    const end = {
      time: endInput.time ? parseTime(endInput.time) : undefined,
      estimation: endInput.estimation
        ? parseTime(endInput.estimation)
        : undefined,
    };

    const durationInput = TaskInput.parseTaskTimeInput(bodyArray[2]);
    if (durationInput === null) {
      return {
        start,
        end,
        duration: null,
        content: bodyArray.slice(2).join(","),
      };
    }

    const duration = {
      time: durationInput.time ? parseDuration(durationInput.time) : undefined,
      estimation: durationInput.estimation
        ? parseDuration(durationInput.estimation)
        : undefined,
    };

    return {
      start,
      end,
      duration,
      content: bodyArray.slice(3).join(","),
    };
  }

  /**
   * Match below patterns:
   * - "HH:mm": capture time
   * - "(HH:mm)": capture estimation
   * - "HH:mm(HH:mm)": capture both time and estimation
   * - "": Empty String: not capture neither time nor estimation
   * if the timeString does not match any of the above patterns, return null.
   * else return an object with the extracted time and estimation.
   **/
  static parseTaskTimeInput(
    timeString: string
  ): { time?: string; estimation?: string } | null {
    const TIME_REGEX =
      /^\s*(?<time>\d{1,2}:\d{1,2})?\s*(?:\s*\(\s*(?<estimation>\d{1,2}:\d{1,2})\s*\)\s*)?$/;

    const match = timeString.match(TIME_REGEX);

    if (match === null) {
      return null;
    }

    return {
      time: match.groups?.time,
      estimation: match.groups?.estimation,
    };
  }
}
