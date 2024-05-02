import type { Duration, Moment } from "moment";
import { Status } from "./Status";
import moment from "moment";

export type TaskComponents = {
  indentation: string;
  listMarker: string;
  statusSymbol: string;
  start?: string;
  end?: string;
  duration?: string;
  body: string;
};

/** Match the indentation at the beginning of a line */
const INDENTATION_REGEX = /^(?<indentation>[\s\t]*)/;

/** Matches - * and + list markers, or numbered list markers (eg 1.) */
const LIST_MARKER_REGEX = /(?<listMarker>[-*+])/;

/** Matches a checkbox and saves the status character inside */
const CHECKBOX_MARKER_REGEX = /\[(?<statusSymbol>.)\]/u;

/** Matches the rest of the task after the checkbox. */
const CHECKBOX_BODY_REGEX = / *(?<body>.*)/u;

/**
 * Main regex for parsing a line. It matches the following:
 * - Indentation
 * - List marker
 * - Status character
 * - Body(Rest of task after checkbox markdown)
 */
const CHECKBOX_REGEX = new RegExp(
  INDENTATION_REGEX.source +
    LIST_MARKER_REGEX.source +
    " +" +
    CHECKBOX_MARKER_REGEX.source +
    CHECKBOX_BODY_REGEX.source,
  "u"
);

export function splitCheckbox(line: string): {
  indentation: string;
  listMarker: string;
  statusSymbol: string;
  body: string;
} {
  const regexMatch = line.match(CHECKBOX_REGEX);

  if (regexMatch === null) {
    throw new Error("Line does not match task regex");
  }

  const { indentation, listMarker, statusSymbol, body } =
    regexMatch.groups ?? {};

  return { indentation, listMarker, statusSymbol, body };
}

export function parseCheckboxComponents(line: string): {
  indentation: string;
  listMarker: string;
  statusSymbol: string;
  status: Status;
  body: string;
} {
  const { indentation, listMarker, statusSymbol, body } = splitCheckbox(line);

  const status = Status.fromSymbol(statusSymbol);

  return {
    indentation,
    listMarker,
    statusSymbol,
    status,
    body,
  };
}

type TaskTime = { time?: Moment; estimation?: Moment };
type TaskDuration = { time?: Duration; estimation?: Duration };

/**
 * Match below patterns:
 * - "HH:mm": capture time
 * - "(HH:mm)": capture estimation
 * - "HH:mm(HH:mm)": capture both time and estimation
 * - "": Empty String: not capture neither time nor estimation
 * if the timeString does not match any of the above patterns, return null.
 * else return an object with the extracted time and estimation.
 **/
export const extractTaskTime = (
  timeString: string
): { time?: string; estimation?: string } | null => {
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
};

// type TaskTime = {
//   actual?: Moment | Duration;
//   planed?: Moment | Duration;
// };

function parseTime(time: string): Moment {
  return moment(time, "HH:mm");
}

function parseDuration(time: string): Duration {
  return moment.duration(time);
}

export function parseTask(body: string): {
  start: TaskTime | null;
  end: TaskTime | null;
  duration: TaskDuration | null;
  task: string[];
} {
  // split body by comma and loop through each part
  const bodyArray = body.split(",");

  // 1つ目の要素が時間として正式なフォーマットor空文字であるかどうかをチェック
  // もし、マッチすればそれはstartとみなすことができる
  const startRaw = extractTaskTime(bodyArray[0]);
  if (startRaw === null) {
    return {
      start: null,
      end: null,
      duration: null,
      task: bodyArray,
    };
  }

  const start = {
    time: startRaw.time ? parseTime(startRaw.time) : undefined,
    estimation: startRaw.estimation
      ? parseTime(startRaw.estimation)
      : undefined,
  };

  // 2つ目の要素が時間として正式なフォーマットor空文字であるかどうかをチェック
  // もし、マッチすればそれはendとみなすことができる
  const endRaw = extractTaskTime(bodyArray[1]);
  if (endRaw === null) {
    return {
      start,
      end: null,
      duration: null,
      task: bodyArray.slice(1),
    };
  }

  const end = {
    time: endRaw.time ? parseTime(endRaw.time) : undefined,
    estimation: endRaw.estimation ? parseTime(endRaw.estimation) : undefined,
  };

  // 3つ目の要素が時間として正式なフォーマットor空文字であるかどうかをチェック
  // もし、マッチすればそれはdurationとみなすことができる
  const durationRaw = extractTaskTime(bodyArray[2]);
  if (durationRaw === null) {
    return {
      start,
      end,
      duration: null,
      task: bodyArray.slice(2),
    };
  }

  const duration = {
    time: durationRaw.time ? parseDuration(durationRaw.time) : undefined,
    estimation: durationRaw.estimation
      ? parseDuration(durationRaw.estimation)
      : undefined,
  };

  return {
    start,
    end,
    duration,
    task: bodyArray.slice(3),
  };
}
