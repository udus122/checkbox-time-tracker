import moment, { type Moment } from "moment";
import { Task } from "./Task";
import { Settings } from "./settings";
import { StatusType } from "./Status";

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
    if (this.settings.enableDoingStatus) {
      if (task.status.type === StatusType.TODO) {
        return this.startTask(task, start_time);
      } else if (task.status.type === StatusType.DOING) {
        return this.endTask(task, end_time);
      } else {
        return task;
      }
    }
    return this.endTask(task, end_time);
  }

  private checkWillIncrement(task: Task, end_time: Moment): boolean {
    return !!(
      this.settings.autoIncrementOnSameTime &&
      task.start &&
      task.start.isSame(end_time, "minute")
    );
  }

  public startTask(task: Task, time: Moment = moment()): Task {
    if (task.status.type !== StatusType.TODO) {
      throw new Error("Task is not in TODO status");
    }

    return task.makeDoing(time);
  }

  public endTask(task: Task, time: Moment = moment()): Task {
    const willIncrement = this.checkWillIncrement(task, time);

    const end_time = willIncrement
      ? time.clone().add(1, "minutes")
      : time.clone();

    return task.makeDone(end_time);
  }
}
