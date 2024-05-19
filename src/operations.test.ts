import moment from "moment";

import { Status } from "./Status";
import { Task } from "./Task";
import { taskOperations } from "./operations";

const DEFAULT_SETTINGS = {
  targetCssClasses: ["checkbox-time-tracker", "ctt"],
  enableDoingStatus: false,
  autoIncrementOnSameTime: false,
};

describe("toggleTask", () => {
  it("start (Doing status is enabled)", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      enableDoingStatus: true,
      autoIncrementOnSameTime: false,
    };

    const task = new Task({
      indentation: "  ",
      listMarker: "-",
      statusSymbol: " ",
      checkboxBody: "Task content",
      status: Status.Todo(),
      start: undefined,
      end: undefined,
      taskBody: "Task content",
    });

    const taskOp = new taskOperations(settings);
    const result = taskOp.toggleTask(task);

    expect(result.start).toBeDefined();
    expect(result.end).toBeUndefined();
  });

  it("start (Doing status is disabled)", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      enableDoingStatus: false,
    };

    const task = new Task({
      indentation: "  ",
      listMarker: "-",
      statusSymbol: " ",
      checkboxBody: "Task content",
      status: Status.Todo(),
      start: undefined,
      end: undefined,
      taskBody: "Task content",
    });

    const taskOp = new taskOperations(settings);
    const result = taskOp.toggleTask(task);

    expect(result.start).toBeUndefined();
    expect(result.end).toBeDefined();
  });

  it("Enabled and start == end ", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      autoIncrementOnSameTime: true,
    };
    const task = new Task({
      indentation: "  ",
      listMarker: "-",
      statusSymbol: "/",
      checkboxBody: "Task content",
      status: Status.Doing(),
      start: moment("10:00", "HH:mm"),
      end: undefined,
      taskBody: "Task content",
    });

    const operations = new taskOperations(settings);
    const result = operations.toggleTask(
      task,
      moment("10:00", "HH:mm"),
      moment("10:00", "HH:mm")
    );

    expect(result.start?.format("HH:mm")).toBe("10:00");
    expect(result.end?.format("HH:mm")).toBe("10:01");
  });

  it("Disabled and start == end", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      autoIncrementOnSameTime: false,
    };
    const task = new Task({
      indentation: "  ",
      listMarker: "-",
      statusSymbol: "/",
      checkboxBody: "Task content",
      status: Status.Doing(),
      start: moment("10:00", "HH:mm"),
      end: undefined,
      taskBody: "Task content",
    });

    const operations = new taskOperations(settings);
    const result = operations.toggleTask(
      task,
      moment("10:00", "HH:mm"),
      moment("10:00", "HH:mm")
    );

    expect(result.start?.format("HH:mm")).toBe("10:00");
    expect(result.end?.format("HH:mm")).toBe("10:00");
  });
});
