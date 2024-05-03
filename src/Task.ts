import { Status } from "./Status";
import { Notice } from "obsidian";
import { TaskInput, TimeInput } from "./TaskInput";
import type { Duration, Moment } from "moment";

export type TaskTime = {
  actual?: Moment;
  planed?: Moment;
};

export type TaskDuration = {
  actual?: Duration;
  planed?: Duration;
};
export class Task {
  public readonly indentation: string;
  public readonly listMarker: string;
  public readonly status: Status;
  public readonly body: string;
  public readonly start: TaskTime | null;
  public readonly end: TaskTime | null;
  public readonly duration: TaskDuration | null;

  constructor({
    indentation,
    listMarker,
    status,
    body,
    start,
    end,
    duration,
  }: {
    indentation: string;
    listMarker: string;
    status: Status;
    start: TaskTime | null;
    end: TaskTime | null;
    duration: TaskDuration | null;
    body: string;
  }) {
    this.indentation = indentation;
    this.listMarker = listMarker;
    this.status = status;
    this.start = start;
    this.end = end;
    this.duration = duration;
    this.body = body;
  }

  public static fromLine(line: string): Task | null {
    const taskInput = TaskInput.fromLine(line);

    const task = Task.fromTaskInput(taskInput);

    if (task === null) {
      return null;
    }

    return task;
  }

  static fromTaskInput(taskInput: TaskInput): Task | null {
    // TODO: Implement this method.
    throw new Error("Not implemented");
  }

  static convertExtractedTimeToTaskTime(time: TimeInput): TaskTime {
    return {
      actual: time.time,
      planed: time.estimation,
    };
  }

  public cancel(): Task {
    if (this.status.type === "DONE") {
      new Notice("Cannot cancel a task already done.");
      return this;
    }
    return new Task({
      ...this,
      status: Status.makeCancelled(),
    });
  }

  public toggle(isCancell: boolean): Task {
    if (isCancell) {
      return this.cancel();
    }

    // Toggle the status of the task to the next status and return the new task.
    return new Task({
      ...this,
      status: Status.fromType(this.status.nextStatusType),
    });
  }

  public computeDuration(): number {
    throw new Error("Not implemented");
  }

  public toString(): string {
    return `${this.indentation}${this.listMarker} [${this.status.symbol}] ${this.body}`;
  }
}
