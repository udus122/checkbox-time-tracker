import { moment } from "obsidian";

import { Status } from "./Status";

import type { Moment } from "moment";

export class Task {
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
}
