import { moment } from "obsidian";
import type { Moment } from "moment";

import { Task } from "./Task";
import { Settings } from "./settings";
import { Status, StatusType } from "./Status";

export class taskOperations {
  private readonly settings: Settings;

  constructor(settings: Settings) {
    this.settings = settings;
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
    const start = task.start?.format("HH:mm") ?? "";
    const startEndSeparator = task.start && task.end ? "-" : "";
    const end = task.end?.format("HH:mm") ?? "";
    const bodySeparator = task.start || task.end ? " " : "";
    return (
      `${task.indentation}${task.listMarker} [${task.status.symbol}] ` +
      `${start}${startEndSeparator}${end}` +
      `${bodySeparator}` +
      `${task.taskBody}`
    );
  }
}
