import moment from "moment";

import { Status, StatusType } from "./Status";

import type { Moment } from "moment";
import { parseTime } from "./utils";

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

  /**
   * Regular expression pattern for matching time values in the format HH:mm.
   * The pattern captures the start time and end time as named groups.
   * ex.
   * - "10:00 task content -> {start: 10:00, body: "task content"}"
   * - "10:00-12:00 task content" -> {start: 10:00, end: 12:00, body: "task content"}
   */
  static readonly TIME_REGEX = new RegExp(
    /^/.source + // beginning of line
      /(?:(?<start>\d{1,2}:\d{1,2}))?/.source + // capture start time (HH:mm)
      /\s*-?\s*/.source + // separator(-)
      /(?:(?<end>(?<=\s*-\s*)\d{1,2}:\d{1,2}))?/.source + // capture end time (HH:mm)
      /\s*/.source + // whitespaces
      /(?<taskBody>.*)/.source //capture task body
  );

  public readonly indentation: string;
  public readonly listMarker: string;
  public readonly statusSymbol: string;
  public readonly checkboxBody: string;

  public readonly status: Status;

  public readonly start?: Moment;
  public readonly end?: Moment;
  public readonly taskBody: string;

  constructor({
    indentation = "",
    listMarker = "-",
    statusSymbol,
    checkboxBody,
    status,
    start,
    end,
    taskBody,
  }: {
    indentation?: string;
    listMarker?: string;
    statusSymbol: string;
    checkboxBody: string;
    // ↑をcheckboxInputとして、Checkboxクラスとして持ってくる?
    status: Status;
    start?: Moment;
    end?: Moment;
    taskBody: string;
  }) {
    this.indentation = indentation;
    this.listMarker = listMarker;
    this.statusSymbol = statusSymbol;
    this.checkboxBody = checkboxBody;
    this.status = status;
    this.start = start;
    this.end = end;
    this.taskBody = taskBody;
  }

  public static fromLine(line: string): Task | undefined {
    const {
      indentation,
      listMarker,
      statusSymbol,
      body: checkboxBody,
    } = Task.splitCheckbox(line);

    const status = Status.fromSymbol(statusSymbol);

    const { start, end, body: taskBody } = Task.parseCheckboxBody(checkboxBody);

    return new Task({
      indentation,
      listMarker,
      statusSymbol,
      checkboxBody,
      status,
      start,
      end,
      taskBody,
    });
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

  /**
   * Parses the checkbox body and extracts the start time, end time, and task body.
   * @param body - The checkbox body to parse.
   * @returns An object containing the start time, end time, and task body.
   * @throws {Error} If the line does not match the task regex.
   * ex.
   * - "10:00 task content -> {start: 10:00, body: "task content"}"
   * - "10:00-12:00 task content" -> {start: 10:00, end: 12:00, body: "task content"}
   */
  static parseCheckboxBody(body: string): {
    start?: Moment;
    end?: Moment;
    body: string;
  } {
    const matchingTimes = body.trim().match(Task.TIME_REGEX);

    if (matchingTimes === null) {
      throw new Error("Line does not match task regex");
    }

    const { start, end, taskBody } = matchingTimes.groups ?? {};

    return {
      start: start ? parseTime(start) : undefined,
      end: end ? parseTime(end) : undefined,
      body: taskBody,
    };
  }

  /**
   * タスクを開始する
   * @returns ステータスがDOINGで、開始時刻の実績が入ったTask
   *
   * タスクの開始時は、先頭が時刻表記であるかどうかに関わらず開始時刻を挿入できるよう、
   * checkboxBodyをtaskBodyにコピーし、startをtimeに設定し、endをundefinedにする
   */
  public begin(time?: Moment): Task {
    return new Task({
      ...this,
      status: Status.Doing(),
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
  public finish(time?: Moment): Task {
    return new Task({
      ...this,
      status: Status.Done(),
      end: time ?? moment(),
    });
  }

  public toggle({
    start_time,
    end_time,
  }: { start_time?: Moment; end_time?: Moment } = {}): Task {
    if (this.status.type === StatusType.TODO) {
      return this.begin(start_time);
    } else if (this.status.type === StatusType.DOING) {
      return this.finish(end_time);
    } else {
      return this;
    }
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
