import { Status } from "./Status";
import { Notice } from "obsidian";
import { TaskInput } from "./TaskInput";
import { type Duration, type Moment } from "moment";
import moment from "moment";

export type TaskTime = {
  fact?: Moment;
  plan?: Moment;
};

export type TaskDuration = {
  fact?: Duration;
  planed?: Duration;
};
export class Task {
  public readonly indentation: string;
  public readonly listMarker: string;
  public readonly status: Status;
  public readonly content: string;
  public readonly start?: TaskTime;
  public readonly end?: TaskTime;
  public readonly duration?: TaskDuration;

  constructor({
    indentation,
    listMarker,
    status,
    start,
    end,
    duration,
    content,
  }: {
    indentation: string;
    listMarker: string;
    status: Status;
    start?: TaskTime;
    end?: TaskTime;
    duration?: TaskDuration;
    content: string;
  }) {
    this.indentation = indentation;
    this.listMarker = listMarker;
    this.status = status;
    this.start = start;
    this.end = end;
    this.duration = duration;
    this.content = content;
  }

  public static fromLine(line: string): Task | undefined {
    const taskInput = TaskInput.fromLine(line);
    const task = Task.fromTaskInput(taskInput);
    return task;
  }

  static fromTaskInput(taskInput: TaskInput): Task | undefined {
    if (taskInput.status.type === "TODO") {
      return new Task({
        indentation: taskInput.indentation,
        listMarker: taskInput.listMarker,
        status: taskInput.status,
        content: taskInput.content,
        start: {
          fact:
            !taskInput.start?.estimation && !!taskInput.start?.time
              ? undefined
              : taskInput.start?.time,
          plan: taskInput.start?.estimation ?? taskInput.start?.time,
        },
        end: {
          fact:
            !taskInput.end?.estimation && !!taskInput.end?.time
              ? undefined
              : taskInput.end?.time,
          plan: taskInput.end?.estimation ?? taskInput.end?.time,
        },
        duration: {
          fact:
            !taskInput.duration?.estimation && !!taskInput.duration?.time
              ? undefined
              : taskInput.duration?.time,
          planed: taskInput.duration?.estimation ?? taskInput.duration?.time,
        },
      });
    } else if (taskInput.status.type === "DOING") {
      return new Task({
        indentation: taskInput.indentation,
        listMarker: taskInput.listMarker,
        status: taskInput.status,
        content: taskInput.content,
        start: {
          fact: taskInput.start?.time,
          plan: taskInput.start?.estimation,
        },
        end: {
          fact:
            !taskInput.end?.estimation && !!taskInput.end?.time
              ? undefined
              : taskInput.end?.time,
          plan: taskInput.end?.estimation ?? taskInput.end?.time,
        },
        duration: {
          fact:
            !taskInput.duration?.estimation && !!taskInput.duration?.time
              ? undefined
              : taskInput.duration?.time,
          planed: taskInput.duration?.estimation ?? taskInput.duration?.time,
        },
      });
    } else {
      return new Task({
        indentation: taskInput.indentation,
        listMarker: taskInput.listMarker,
        status: taskInput.status,
        content: taskInput.content,
        start: {
          fact: taskInput.start?.time,
          plan: taskInput.start?.estimation,
        },
        end: {
          fact: taskInput.end?.time,
          plan: taskInput.end?.estimation,
        },
        duration: {
          fact: taskInput.duration?.time,
          planed: taskInput.duration?.estimation,
        },
      });
    }
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

    if (this.status.type === "TODO") {
      return new Task({
        ...this,
        status: Status.fromType(this.status.nextStatusType),
        start: {
          ...this.start,
          fact: this.start?.fact ?? moment(),
        },
      });
    } else if (this.status.type === "DOING") {
      return new Task({
        ...this,
        status: Status.fromType(this.status.nextStatusType),
        end: {
          ...this.end,
          fact: this.end?.fact ?? moment(),
        },
      });
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
    const checkbox = `${this.indentation}${this.listMarker} [${this.status.symbol}]`;
    const start = `${this.start?.fact ? this.start.fact.format("HH:mm") : ""}${
      this.start?.plan ? `(${this.start?.plan.format("HH:mm")})` : ""
    }`;
    const end = `${this.end?.fact ? this.end.fact.format("HH:mm") : ""}${
      this.end?.plan ? `(${this.end?.plan.format("HH:mm")})` : ""
    }`;
    const duration = `${
      this.duration?.fact
        ? `${this.duration.fact.hours()}:${this.duration?.fact?.minutes()}`
        : ""
    }${
      this.duration?.planed
        ? `(${this.duration.planed.hours()}:${this.duration?.planed?.minutes()})`
        : ""
    }`;
    return `${checkbox} ${start},${end},${duration},${this.content}`;
  }
}
