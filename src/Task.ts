import type { Moment } from "moment";
import { TaskRegularExpressions } from "./TaskRegularExpressions";
import { Status } from "./Status";
import { Notice } from "obsidian";

export class Task {
  public readonly indentation: string;
  public readonly listMarker: string;
  public readonly status: Status;
  public readonly body: string;
  public readonly start_time_actual: Moment | null;
  public readonly start_time_planed: Moment | null;
  public readonly end_time_actual: Moment | null;
  public readonly end_time_planed: Moment | null;
  public readonly duration_actual: Moment | null;
  public readonly duration_planed: Moment | null;

  constructor({
    indentation,
    listMarker,
    status,
    body,
    start_time_actual,
    start_time_planed,
    end_time_actual,
    end_time_planed,
    duration_actual,
    duration_planed,
  }: {
    indentation: string;
    listMarker: string;
    status: Status;
    body: string;
    start_time_actual: Moment | null;
    start_time_planed: Moment | null;
    end_time_actual: Moment | null;
    end_time_planed: Moment | null;
    duration_actual: Moment | null;
    duration_planed: Moment | null;
  }) {
    this.indentation = indentation;
    this.listMarker = listMarker;
    this.status = status;
    this.body = body;
    this.start_time_actual = start_time_actual;
    this.start_time_planed = start_time_planed;
    this.end_time_actual = end_time_actual;
    this.end_time_planed = end_time_planed;
    this.duration_actual = duration_actual;
    this.duration_planed = duration_planed;
  }

  public static fromLine(line: string): Task | null {
    const taskComponents = Task.extractTaskComponents(line);
    // Check the line to see if it is a markdown task.
    if (taskComponents === null) {
      return null;
    }

    const taskInfo = Task.extractTaskInfo(taskComponents.body);

    return new Task({
      ...taskComponents,
      ...taskInfo,
    });
  }

  static extractTaskComponents(line: string): TaskComponents | null {
    // Check the line to see if it is a markdown task.
    const regexMatch = line.match(TaskRegularExpressions.taskRegex);

    if (regexMatch === null) {
      return null;
    }

    const indentation = regexMatch[1];
    const listMarker = regexMatch[2];

    // Get the status of the task.
    const statusSymbol = regexMatch[3];
    const status = Status.fromSymbol(statusSymbol);

    // match[4] includes the whole body of the task after the brackets.
    const body = regexMatch[4].trim();

    return { indentation, listMarker, status, body };
  }

  public static extractTaskInfo(body: string): {
    start_time_actual: Moment | null;
    start_time_planed: Moment | null;
    end_time_actual: Moment | null;
    end_time_planed: Moment | null;
    duration_actual: Moment | null;
    duration_planed: Moment | null;
  } {
    const start_time_actual = null;
    const start_time_planed = null;
    const end_time_actual = null;
    const end_time_planed = null;
    const duration_actual = null;
    const duration_planed = null;

    return {
      start_time_actual,
      start_time_planed,
      end_time_actual,
      end_time_planed,
      duration_actual,
      duration_planed,
    };
  }

  public cancel(): Task {
    if (this.status.type === "DONE") {
      new Notice("Cannot cancel a task that is already done.");
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
    // debugger;
    return `${this.indentation}${this.listMarker} [${this.status.symbol}] ${this.body}`;
  }
}
