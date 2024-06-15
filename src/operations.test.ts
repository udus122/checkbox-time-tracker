import moment from "moment";

import { Status, StatusType } from "./Status";
import { Task } from "./Task";
import { taskOperations } from "./operations";

const DEFAULT_SETTINGS = {
  targetCssClasses: ["checkbox-time-tracker", "ctt"],
  timeFormat: "HH:mm",
  separator: "-",
  insertDate: false,
  dateFormat: "YYYY-MM-DD",
  enableDoingStatus: false,
  disableDoingStatusForSubTasks: false,
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
describe("toggleTask", () => {
  it("Todo to Doing", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      enableDoingStatus: true,
      DisableDoingStatusForSubTasks: false,
    };

    const task = new Task({
      indentation: "  ",
      listMarker: "-",
      checkboxBody: "Task content",
      status: Status.Todo(),
      start: undefined,
      end: undefined,
      taskBody: "Task content",
    });

    const taskOp = new taskOperations(settings);
    const result = taskOp.toggleTask(task);

    expect(result.status.type).toBe(StatusType.DOING);
    expect(result.start).toBeDefined();
    expect(result.end).toBeUndefined();
  });

  it("Doing to Done", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      enableDoingStatus: true,
      DisableDoingStatusForSubTasks: false,
    };

    const task = new Task({
      indentation: "  ",
      listMarker: "-",
      checkboxBody: "Task content",
      status: Status.Doing(),
      start: moment("10:00", "HH:mm"),
      end: undefined,
      taskBody: "Task content",
    });

    const taskOp = new taskOperations(settings);
    const result = taskOp.toggleTask(task);

    expect(result.status.type).toBe(StatusType.DONE);
    expect(result.start).toBeDefined();
    expect(result.end).toBeDefined();
  });

  it("Todo to Done (Doing status is disabled)", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      enableDoingStatus: false,
      DisableDoingStatusForSubTasks: false,
    };

    const task = new Task({
      indentation: "  ",
      listMarker: "-",
      checkboxBody: "Task content",
      status: Status.Todo(),
      start: undefined,
      end: undefined,
      taskBody: "Task content",
    });

    const taskOp = new taskOperations(settings);
    const result = taskOp.toggleTask(task);

    expect(result.status.type).toBe(StatusType.DONE);
    expect(result.start).toBeUndefined();
    expect(result.end).toBeDefined();
  });

  it("Todo to Done (DisableDoingStatusForSubTasks is true)", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      enableDoingStatus: true,
      disableDoingStatusForSubTasks: true,
    };

    const task = new Task({
      indentation: "    ",
      listMarker: "-",
      checkboxBody: "Task content",
      status: Status.Todo(),
      start: undefined,
      end: undefined,
      taskBody: "Task content",
    });

    const taskOp = new taskOperations(settings);
    const result = taskOp.toggleTask(task);

    expect(result.status.type).toBe(StatusType.DONE);
    expect(result.start).toBeUndefined();
    expect(result.end).toBeDefined();
  });
});

describe("duplicateTask", () => {
  it("should duplicate a task with the same properties", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      enableDoingStatus: true,
      DisableDoingStatusForSubTasks: false,
    };

    const task = new Task({
      indentation: "  ",
      listMarker: "-",
      checkboxBody: "Task content",
      status: Status.Todo(),
      start: undefined,
      end: undefined,
      taskBody: "Task content",
    });

    const taskOp = new taskOperations(settings);
    const duplicatedTask = taskOp.duplicateTask(task);

    expect(duplicatedTask.indentation).toBe(task.indentation);
    expect(duplicatedTask.listMarker).toBe(task.listMarker);
    expect(duplicatedTask.checkboxBody).toBe(task.checkboxBody);
    expect(duplicatedTask.status.type).toBe(task.status.type);
    expect(duplicatedTask.start).toBeUndefined();
    expect(duplicatedTask.end).toBeUndefined();
    expect(duplicatedTask.taskBody).toBe(task.taskBody);
  });
});

describe("formatTask", () => {
  it("  - [x] 10:00-12:00 Task content", () => {
    const task = new Task({
      indentation: "  ",
      listMarker: "-",
      checkboxBody: "Task content",
      status: Status.Done(),
      start: moment("10:00", "HH:mm"),
      end: moment("12:00", "HH:mm"),
      taskBody: "Task content",
    });

    const settings = {
      ...DEFAULT_SETTINGS,
    };
    const taskOp = new taskOperations(settings);

    const result = taskOp.formatTask(task);

    expect(result).toBe("  - [x] 10:00-12:00 Task content");
  });

  it("  - [x] 10:00 Task content", () => {
    const task = new Task({
      indentation: "  ",
      listMarker: "-",
      checkboxBody: "Task content",
      status: Status.Done(),
      start: moment("10:00", "HH:mm"),
      end: undefined,
      taskBody: "Task content",
    });

    const settings = {
      ...DEFAULT_SETTINGS,
    };
    const taskOp = new taskOperations(settings);
    const result = taskOp.formatTask(task);

    expect(result).toBe("  - [x] 10:00 Task content");
  });

  it("  - [x] Task content", () => {
    const task = new Task({
      indentation: "  ",
      listMarker: "-",
      checkboxBody: "Task content",
      status: Status.Done(),
      start: undefined,
      end: undefined,
      taskBody: "Task content",
    });

    const settings = {
      ...DEFAULT_SETTINGS,
    };
    const taskOp = new taskOperations(settings);
    const result = taskOp.formatTask(task);

    expect(result).toBe("  - [x] Task content");
  });
});
