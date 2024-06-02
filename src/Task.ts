import { moment } from "obsidian";

import { Status } from "./Status";
import { parseTime } from "./utils";

import type { Moment } from "moment";

export class Task {
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
    Task.INDENTATION_REGEX.source +
      Task.LIST_MARKER_REGEX.source +
      " +" +
      Task.CHECKBOX_MARKER_REGEX.source +
      Task.CHECKBOX_BODY_REGEX.source,
    "u"
  );

  public readonly indentation: string;
  public readonly listMarker: string;
  public readonly checkboxBody: string;

  public readonly status: Status;

  public readonly start?: Moment;
  public readonly end?: Moment;
  public readonly taskBody: string;

  constructor({
    indentation = "",
    listMarker = "-",
    checkboxBody,
    status,
    start,
    end,
    taskBody,
  }: {
    indentation?: string;
    listMarker?: string;
    checkboxBody: string;
    status: Status;
    start?: Moment;
    end?: Moment;
    taskBody: string;
  }) {
    this.indentation = indentation;
    this.listMarker = listMarker;
    this.checkboxBody = checkboxBody;
    this.status = status;
    this.start = start;
    this.end = end;
    this.taskBody = taskBody;
  }

  public static fromLine(line: string): Task | undefined {
    const { statusSymbol } = Task.splitCheckbox(line);
    const status = Status.fromSymbol(statusSymbol);

    if (Status.isTodo(status)) {
      return Task.parseTodo(line);
    } else if (Status.isDoing(status)) {
      return Task.parseDoing(line);
    } else if (Status.isDone(status)) {
      return Task.parseDone(line);
    }
  }

  static splitCheckbox(line: string): {
    indentation: string;
    listMarker: string;
    statusSymbol: string;
    body: string;
  } {
    const regexMatch = line.match(Task.CHECKBOX_REGEX);

    if (regexMatch === null) {
      throw new Error("Line does not match task regex");
    }

    const { indentation, listMarker, statusSymbol, body } =
      regexMatch.groups ?? {};

    return { indentation, listMarker, statusSymbol, body };
  }

  static parseTodo(line: string): Task {
    const {
      indentation,
      listMarker,
      statusSymbol,
      body: checkboxBody,
    } = Task.splitCheckbox(line);
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

  static parseDoing(line: string): Task {
    const DOING_BODY_REGEX = /^\s*(?<start>\d{1,2}:\d{1,2})\s+(?<taskBody>.*)/;

    const {
      indentation,
      listMarker,
      statusSymbol,
      body: checkboxBody,
    } = Task.splitCheckbox(line);
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

  static parseDone(line: string): Task {
    const DONE_BODY_REGEX =
      /^(?<start>\d{1,2}:\d{1,2})-(?<end>\d{1,2}:\d{1,2})\s+(?<taskBody>.*)/;

    const {
      indentation,
      listMarker,
      statusSymbol,
      body: checkboxBody,
    } = Task.splitCheckbox(line);
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

  /**
   * Parses the checkbox body and extracts the start time, end time, and task body.
   * @param body - The checkbox body to parse.
   * @returns An object containing the start time, end time, and task body.
   * @throws {Error} If the line does not match the task regex.
   * ex.
   * - "10:00 task content -> {start: 10:00, body: "task content"}"
   * - "10:00-12:00 task content" -> {start: 10:00, end: 12:00, body: "task content"}
   */

  /**
   * タスクを開始する
   * @returns ステータスがDOINGで、開始時刻の実績が入ったTask
   *
   * タスクの開始時は、先頭が時刻表記であるかどうかに関わらず開始時刻を挿入できるよう、
   * checkboxBodyをtaskBodyにコピーし、startをtimeに設定し、endをundefinedにする
   */
  public makeDoing(time?: Moment): Task {
    return new Task({
      ...this,
      status: Status.Doing(),
      // @ts-expect-error: In obsidian.d.ts, Moment is namespace imported instead of default imported.
      start: time ?? moment(),
      end: undefined,
      taskBody: this.checkboxBody,
    });
  }

  /**
   * タスクを終了する
   * @returns ステータスがDONEで、終了時刻の実績が入ったTask
   *
   * タスク終了時は、終了時刻
   */
  public makeDone(time?: Moment): Task {
    return new Task({
      ...this,
      status: Status.Done(),
      // @ts-expect-error: In obsidian.d.ts, Moment is namespace imported instead of default imported.
      end: time ?? moment(),
    });
  }

  public toString(): string {
    const start = this.start?.format("HH:mm") ?? "";
    const startEndSeparator = this.start && this.end ? "-" : "";
    const end = this.end?.format("HH:mm") ?? "";
    const bodySeparator = this.start || this.end ? " " : "";
    return (
      `${this.indentation}${this.listMarker} [${this.status.symbol}] ` +
      `${start}${startEndSeparator}${end}` +
      `${bodySeparator}` +
      `${this.taskBody}`
    );
  }
}
