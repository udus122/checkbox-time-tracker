import moment from "moment";

import { Status, StatusType } from "./Status";
import { TaskInput } from "./TaskInput";

import type { Duration, Moment } from "moment";

export type TaskTime = {
  fact?: Moment;
  plan?: Moment;
};

export type TaskDuration = {
  fact?: Duration;
  plan?: Duration;
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
    indentation = "",
    listMarker = "-",
    status = Status.makeTodo(),
    start,
    end,
    duration,
    content,
  }: {
    indentation?: string;
    listMarker?: string;
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
    return Task.fromTaskInput(taskInput);
  }

  static fromTaskInput(taskInput: TaskInput): Task | undefined {
    if (taskInput.status.type === StatusType.TODO) {
      return Task.fromTodoInput(taskInput);
    } else if (taskInput.status.type === StatusType.DOING) {
      return Task.fromDoingInput(taskInput);
    } else {
      return Task.fromOtherInput(taskInput);
    }
  }
  static fromTodoInput(taskInput: TaskInput): Task {
    if (taskInput.status.type !== StatusType.TODO) {
      throw new Error("TaskInput is not a TODO task.");
    }
    // TODOタスクを読み取る際は、timeを優先的にplanに格納する(start, end, duration)
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
        plan: taskInput.duration?.estimation ?? taskInput.duration?.time,
      },
    });
  }
  static fromDoingInput(taskInput: TaskInput): Task {
    if (taskInput.status.type !== StatusType.DOING) {
      throw new Error("TaskInput is not a DOING task.");
    }
    // DOINGタスクを読み取る際は、timeを優先的にplanに格納する(end, duration)
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
        plan: taskInput.duration?.estimation ?? taskInput.duration?.time,
      },
    });
  }
  static fromOtherInput(taskInput: TaskInput): Task {
    // その他の場合は、timeをfactに、estimationをplanに格納する
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
        plan: taskInput.duration?.estimation,
      },
    });
  }

  public cancel(): Task {
    if (this.status.type === "DONE") {
      throw new Error("Cannot cancel a task already done.");
    }
    return new Task({
      ...this,
      status: Status.makeCancelled(),
    });
  }

  public toggle(isCancell: boolean = false): Task {
    if (isCancell) {
      return this.cancel();
    }
    if (this.status.type === StatusType.TODO) {
      return new Task({
        ...this,
        status: this.status.nextStatus(),
        start: {
          ...this.start,
          fact: this.start?.fact ?? moment(),
        },
      });
    } else if (this.status.type === StatusType.DOING) {
      return new Task({
        ...this,
        status: this.status.nextStatus(),
        end: {
          ...this.end,
          fact: this.end?.fact ?? moment(),
        },
      });
    } else {
      // Toggle the status of the task to the next status and return the new task.
      return new Task({
        ...this,
        status: this.status.nextStatus(),
      });
    }
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
      this.duration?.plan
        ? `(${this.duration.plan.hours()}:${this.duration?.plan?.minutes()})`
        : ""
    }`;
    return `${checkbox} ${start},${end},${duration},${this.content}`;
  }
}
