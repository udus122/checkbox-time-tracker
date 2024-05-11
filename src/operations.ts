import moment, { type Moment } from "moment";
import { Task } from "./Task";
import { Settings } from "./settings";

export class taskOperations {
  private readonly settings: Settings;

  constructor(settings: Settings) {
    this.settings = settings;
  }

  public toggleTask(
    task: Task,
    start_time: Moment = moment(),
    end_time: Moment = moment()
  ): Task {
    // autoIncrementOnSameTime is enabled and
    // start time and end time are the same.
    const willIncrement =
      this.settings.autoIncrementOnSameTime &&
      task.start &&
      task.start.isSame(end_time, "minute");

    return task.toggle({
      start_time,
      end_time: willIncrement
        ? task.start?.clone().add(1, "minutes")
        : end_time,
    });
  }
}
