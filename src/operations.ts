import { moment } from "obsidian";
import type { Moment } from "moment";

import { Task } from "./Task";
import { Settings } from "./settings";
import { Status, StatusType } from "./Status";
import { parseTime } from "./utils";

export class taskOperations {
  private readonly settings: Settings;

  constructor(settings: Settings) {
    this.settings = settings;
  }

  public parseLine(line: string): Task | undefined {
    const { statusSymbol } = splitCheckbox(line);
    const status = Status.fromSymbol(statusSymbol);

    if (Status.isTodo(status)) {
      return this.parseTodo(line);
    } else if (Status.isDoing(status)) {
      return this.parseDoing(line);
    } else if (Status.isDone(status)) {
      return this.parseDone(line);
    }
  }

  private parseTodo(line: string): Task {
    const {
      indentation,
      listMarker,
      statusSymbol,
      body: checkboxBody,
    } = splitCheckbox(line);
    const status = Status.fromSymbol(statusSymbol);

    return new Task({
      indentation,
      listMarker,
      status,
      checkboxBody,
      start: undefined,
      end: undefined,
      taskBody: checkboxBody,
    });
  }

  private parseDoing(line: string): Task {
    const DOING_BODY_REGEX = /^\s*(?<start>\d{1,2}:\d{1,2})\s+(?<taskBody>.*)/;

    const {
      indentation,
      listMarker,
      statusSymbol,
      body: checkboxBody,
    } = splitCheckbox(line);
    const status = Status.fromSymbol(statusSymbol);

    const matchingTimes = checkboxBody.match(DOING_BODY_REGEX);

    if (matchingTimes === null) {
      throw new Error("Line does not match Doing regex");
    }

    const { start, taskBody } = matchingTimes.groups ?? {};

    return new Task({
      indentation,
      listMarker,
      status,
      checkboxBody,
      start: parseTime(start),
      end: undefined,
      taskBody,
    });
  }

  private parseDone(line: string): Task {
    const DONE_BODY_REGEX =
      /^(?<start>\d{1,2}:\d{1,2})\s*-\s*(?<end>\d{1,2}:\d{1,2})\s+(?<taskBody>.*)/;

    const {
      indentation,
      listMarker,
      statusSymbol,
      body: checkboxBody,
    } = splitCheckbox(line);
    const status = Status.fromSymbol(statusSymbol);

    const matchingTimes = checkboxBody.trim().match(DONE_BODY_REGEX);

    if (matchingTimes === null) {
      throw new Error("Line does not match Done regex");
    }

    const { start, end, taskBody } = matchingTimes.groups ?? {};

    return new Task({
      indentation,
      listMarker,
      status,
      checkboxBody,
      start: parseTime(start),
      end: parseTime(end),
      taskBody,
    });
  }

  public toggleTask(
    task: Task,
    // @ts-expect-error: In obsidian.d.ts, Moment is namespace imported instead of default imported.
    start_time: Moment = moment(),
    // @ts-expect-error: In obsidian.d.ts, Moment is namespace imported instead of default imported.
    end_time: Moment = moment()
  ): Task {
    // Todo/Done mode (Doing status is disabled)
    if (
      !this.settings.enableDoingStatus ||
      (this.settings.disableDoingStatusForSubTasks &&
        task.indentation.length > 0)
    ) {
      return this.endTask(task, end_time);
    }

    // Todo/Doing/Done mode (Doing status is enabled)
    if (task.status.type === StatusType.TODO) {
      return this.startTask(task, start_time);
    } else if (task.status.type === StatusType.DOING) {
      return this.endTask(task, end_time);
    } else {
      return task;
    }
  }

  /**
   * Duplicate a task as new task
   * @param task
   */
  public duplicateTask(task: Task): Task {
    return new Task({
      ...task,
      checkboxBody: task.taskBody,
      status: Status.Todo(),
      start: undefined,
      end: undefined,
    });
  }

  private checkWillIncrement(task: Task, end_time: Moment): boolean {
    return !!(
      this.settings.autoIncrementOnSameTime &&
      task.start &&
      task.start.isSame(end_time, "minute")
    );
  }
  // @ts-expect-error: In obsidian.d.ts, Moment is namespace imported instead of default imported.
  public startTask(task: Task, time: Moment = moment()): Task {
    if (task.status.type !== StatusType.TODO) {
      throw new Error("Task is not in TODO status");
    }

    return task.makeDoing(time);
  }
  // @ts-expect-error: In obsidian.d.ts, Moment is namespace imported instead of default imported.
  public endTask(task: Task, time: Moment = moment()): Task {
    const willIncrement = this.checkWillIncrement(task, time);

    const end_time = willIncrement
      ? time.clone().add(1, "minutes")
      : time.clone();

    return task.makeDone(end_time);
  }

  public formatTask(task: Task): string {
    const start = task.start?.format(this.settings.timeFormat) ?? "";
    const startEndSeparator = task.start && task.end ? "-" : "";
    const end = task.end?.format(this.settings.timeFormat) ?? "";
    const bodySeparator = task.start || task.end ? " " : "";
    return (
      `${task.indentation}${task.listMarker} [${task.status.symbol}] ` +
      `${start}${startEndSeparator}${end}` +
      `${bodySeparator}` +
      `${task.taskBody}`
    );
  }
}

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

/**
 * Parses the checkbox body and extracts the start time, end time, and task body.
 * @param body - The checkbox body to parse.
 * @returns An object containing the start time, end time, and task body.
 * @throws {Error} If the line does not match the task regex.
 * ex.
 * - "10:00 task content -> {start: 10:00, body: "task content"}"
 * - "10:00-12:00 task content" -> {start: 10:00, end: 12:00, body: "task content"}
 */
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
