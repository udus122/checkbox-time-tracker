import { Task } from "./Task";
import { Settings } from "./settings";

export class taskOperations {
  private readonly settings: Settings;

  constructor(settings: Settings) {
    this.settings = settings;
  }

  public toggleTask(task: Task): Task {
    return task.toggle({
      end_time: this.settings.autoIncrementOnSameTime
        ? task.start?.clone().add(1, "minutes")
        : undefined,
    });
  }
}
