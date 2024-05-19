import moment from "moment";

import { Status } from "./Status";
import { Task } from "./Task";
import { taskOperations } from "./operations";
import { DEFAULT_SETTINGS } from "./settings";

describe("toggleTask", () => {
  it("start", () => {
    DEFAULT_SETTINGS.autoIncrementOnSameTime = true;

    const task = new Task({
      indentation: "  ",
      listMarker: "-",
      statusSymbol: "x",
      checkboxBody: "Task content",
      status: Status.Todo(),
      start: undefined,
      end: undefined,
      taskBody: "Task content",
    });

    const taskOp = new taskOperations(DEFAULT_SETTINGS);
    const result = taskOp.toggleTask(task);

    expect(result.start).toBeDefined();
    expect(result.end).toBeUndefined();
  });

  it("Enabled and start = end ", () => {
    const task = new Task({
      indentation: "  ",
      listMarker: "-",
      statusSymbol: "x",
      checkboxBody: "Task content",
      status: Status.Doing(),
      start: moment("10:00", "HH:mm"),
      end: undefined,
      taskBody: "Task content",
    });

    const operations = new taskOperations(DEFAULT_SETTINGS);
    const result = operations.toggleTask(
      task,
      moment("10:00", "HH:mm"),
      moment("10:00", "HH:mm")
    );

    expect(result.start?.isSame(moment("10:00", "HH:mm"))).toBe(true);
    expect(result.end?.isSame(moment("10:01", "HH:mm"))).toBe(true);
  });

  it("Disabled and start == end", () => {
    const task = new Task({
      indentation: "  ",
      listMarker: "-",
      statusSymbol: "x",
      checkboxBody: "Task content",
      status: Status.Doing(),
      start: moment("10:00", "HH:mm"),
      end: undefined,
      taskBody: "Task content",
    });

    const operations = new taskOperations(DEFAULT_SETTINGS);
    const result = operations.toggleTask(
      task,
      moment("10:00", "HH:mm"),
      moment("10:00", "HH:mm")
    );

    expect(result.start?.isSame(moment("10:00", "HH:mm"))).toBe(true);
    expect(result.end?.isSame(moment("10:00", "HH:mm"))).toBe(true);
  });
});
