import moment from "moment";

import { Status, StatusType } from "./Status";
import { Task } from "./Task";
import { splitCheckbox, taskOperations } from "./operations";

const DEFAULT_SETTINGS = {
  targetCssClasses: ["checkbox-time-tracker", "ctt"],
  timeFormat: "HH:mm",
  separator: "-",
  enableDateInserting: false,
  dateFormat: "YYYY-MM-DD",
  omitEndDateOnSameDate: false,
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

  it("  - [x] 2024-06-15 10:00 - 2024-06-16 12:00 Task content", () => {
    const task = new Task({
      indentation: "  ",
      listMarker: "-",
      checkboxBody: "Task content",
      status: Status.Done(),
      start: moment("2024-06-15 10:00", "YYYY-MM-DD HH:mm"),
      end: moment("2024-06-16 12:00", "YYYY-MM-DD HH:mm"),
      taskBody: "Task content",
    });

    const settings = {
      ...DEFAULT_SETTINGS,
      enableDateInserting: true,
      separator: " - ",
    };
    const taskOp = new taskOperations(settings);

    const result = taskOp.formatTask(task);

    expect(result).toBe(
      "  - [x] 2024-06-15 10:00 - 2024-06-16 12:00 Task content"
    );
  });

  it("  - [x] 2024-06-15 10:00 - 12:00 Task content", () => {
    const task = new Task({
      indentation: "  ",
      listMarker: "-",
      checkboxBody: "Task content",
      status: Status.Done(),
      start: moment("2024-06-15 10:00", "YYYY-MM-DD HH:mm"),
      end: moment("2024-06-15 12:00", "YYYY-MM-DD HH:mm"),
      taskBody: "Task content",
    });

    const settings = {
      ...DEFAULT_SETTINGS,
      enableDateInserting: true,
      omitEndDateOnSameDate: true,
      separator: " - ",
    };
    const taskOp = new taskOperations(settings);

    const result = taskOp.formatTask(task);

    expect(result).toBe("  - [x] 2024-06-15 10:00 - 12:00 Task content");
  });

  it("  - [x] 2024-06-15 10:00 - 2024-06-16 12:00 Task content", () => {
    const task = new Task({
      indentation: "  ",
      listMarker: "-",
      checkboxBody: "Task content",
      status: Status.Done(),
      start: moment("2024-06-15 10:00", "YYYY-MM-DD HH:mm"),
      end: moment("2024-06-16 12:00", "YYYY-MM-DD HH:mm"),
      taskBody: "Task content",
    });

    const settings = {
      ...DEFAULT_SETTINGS,
      enableDateInserting: true,
      omitEndDateOnSameDate: true,
      separator: " - ",
    };
    const taskOp = new taskOperations(settings);

    const result = taskOp.formatTask(task);

    expect(result).toBe(
      "  - [x] 2024-06-15 10:00 - 2024-06-16 12:00 Task content"
    );
  });
});

describe("fromLine", () => {
  it("- [ ] task content", () => {
    const body = "- [ ] task content";
    const taskOp = new taskOperations(DEFAULT_SETTINGS);
    const result = taskOp.parseLine(body);

    expect(result?.start).toBeUndefined();
    expect(result?.end).toBeUndefined();
    expect(result?.taskBody).toBe("task content");
  });

  it("- [ ] 10:00-12:00(1h30m) task content", () => {
    const body = "- [ ] task content";
    const taskOp = new taskOperations(DEFAULT_SETTINGS);
    const result = taskOp.parseLine(body);

    expect(result?.start).toBeUndefined();
    expect(result?.end).toBeUndefined();
    expect(result?.taskBody).toBe("task content");
  });

  it("- [/] 11:00 10:00-12:00(1h30m) task content", () => {
    const body = "- [/] 11:00 10:00-12:00(1h30m) task content";
    const taskOp = new taskOperations(DEFAULT_SETTINGS);
    const result = taskOp.parseLine(body);

    expect(result?.start?.format("HH:mm")).toBe("11:00");
    expect(result?.end).toBeUndefined();
    expect(result?.taskBody).toBe("10:00-12:00(1h30m) task content");
  });

  it("- [/] 10:00-12:00(1h30m) task content", () => {
    const body = "- [/] 10:00-12:00(1h30m) task content";
    expect(() => {
      const taskOp = new taskOperations(DEFAULT_SETTINGS);
      taskOp.parseLine(body);
    }).toThrow("Invalid date-time format. Expected format: HH:mm.");
  });

  it("- [/] 10:00 task content", () => {
    const body = "- [/] 10:00 task content";
    const taskOp = new taskOperations(DEFAULT_SETTINGS);
    const result = taskOp.parseLine(body);

    expect(result?.start?.format("HH:mm")).toBe("10:00");
    expect(result?.end).toBeUndefined();
    expect(result?.taskBody).toBe("task content");
  });

  it("- [/] 10:00 ", () => {
    const body = "- [/] 10:00 ";
    const taskOp = new taskOperations(DEFAULT_SETTINGS);
    const result = taskOp.parseLine(body);

    expect(result?.start?.format("HH:mm")).toBe("10:00");
    expect(result?.end).toBeUndefined();
    expect(result?.taskBody).toBe("");
  });

  it("- [/] 2024-06-15 10:00 task content", () => {
    const body = "- [/] 2024-06-15 10:00 task content";
    const taskOp = new taskOperations({
      ...DEFAULT_SETTINGS,
      enableDateInserting: true,
    });
    const result = taskOp.parseLine(body);
    expect(result?.start?.format("YYYY-MM-DD HH:mm")).toBe("2024-06-15 10:00");
    expect(result?.taskBody).toBe("task content");
  });

  it("- [/] [[2024-06-15]] 10:00 task content", () => {
    const body = "- [/] [[2024-06-15]] 10:00 task content";
    const taskOp = new taskOperations({
      ...DEFAULT_SETTINGS,
      enableDateInserting: true,
      dateFormat: "\\[\\[YYYY-MM-DD\\]\\]",
    });
    const result = taskOp.parseLine(body);
    expect(result?.start?.format("YYYY-MM-DD HH:mm")).toBe("2024-06-15 10:00");
    expect(result?.taskBody).toBe("task content");
  });

  it("- [/] 2024/06/15 10:00 task content", () => {
    const body = "- [/] [[2024-06-15]] 10:00 task content";
    const taskOp = new taskOperations({
      ...DEFAULT_SETTINGS,
      enableDateInserting: true,
      dateFormat: "\\[\\[YYYY-MM-DD\\]\\]",
    });
    const result = taskOp.parseLine(body);
    expect(result?.start?.format("YYYY-MM-DD HH:mm")).toBe("2024-06-15 10:00");
    expect(result?.taskBody).toBe("task content");
  });

  it("- [x] 10:00-12:00 task content", () => {
    const body = "- [x] 10:00-12:00 task content";
    const taskOp = new taskOperations(DEFAULT_SETTINGS);
    const result = taskOp.parseLine(body);

    expect(result?.start?.format("HH:mm")).toBe("10:00");
    expect(result?.end?.format("HH:mm")).toBe("12:00");
    expect(result?.taskBody).toBe("task content");
  });

  it("- [x] 10:00-12:00 11:00-12:00(1h) task content", () => {
    const body = "- [x] 10:00-12:00 11:00-12:00(1h) task content";
    const taskOp = new taskOperations(DEFAULT_SETTINGS);
    const result = taskOp.parseLine(body);

    expect(result?.start?.format("HH:mm")).toBe("10:00");
    expect(result?.end?.format("HH:mm")).toBe("12:00");
    expect(result?.taskBody).toBe("11:00-12:00(1h) task content");
  });

  it("- [x] 2024-06-15 10:00 - 2024-06-15 12:00 11:00-13:00(2h) task content", () => {
    const body =
      "- [x] 2024-06-15 10:00 - 2024-06-15 12:00 11:00-13:00(2h) task content";
    const taskOp = new taskOperations({
      ...DEFAULT_SETTINGS,
      enableDateInserting: true,
      separator: " - ",
    });
    const result = taskOp.parseLine(body);

    expect(result?.start?.format("HH:mm")).toBe("10:00");
    expect(result?.end?.format("HH:mm")).toBe("12:00");
    expect(result?.taskBody).toBe("11:00-13:00(2h) task content");
  });

  it("- [x] 2024-06-14 10:00 - 2024-06-16 12:00 11:00-13:00(2h) task content", () => {
    const body =
      "- [x] 2024-06-14 10:00 - 2024-06-16 12:00 11:00-13:00(2h) task content";
    const taskOp = new taskOperations({
      ...DEFAULT_SETTINGS,
      enableDateInserting: true,
      separator: " - ",
    });
    const result = taskOp.parseLine(body);

    expect(result?.start?.format("YYYY-MM-DD")).toBe("2024-06-14");
    expect(result?.start?.format("HH:mm")).toBe("10:00");
    expect(result?.end?.format("YYYY-MM-DD")).toBe("2024-06-16");
    expect(result?.end?.format("HH:mm")).toBe("12:00");
    expect(result?.taskBody).toBe("11:00-13:00(2h) task content");
  });

  it("- [x] 10:00 task content", () => {
    const body = "- [x] 10:00 task content";

    expect(() => {
      const taskOp = new taskOperations(DEFAULT_SETTINGS);
      taskOp.parseLine(body);
    }).toThrow("Line does not match Done regex");
  });
});

describe("splitCheckbox", () => {
  it("should split the checkbox line correctly", () => {
    const line = "  - [x] Task content";
    const result = splitCheckbox(line);

    expect(result.indentation).toBe("  ");
    expect(result.listMarker).toBe("-");
    expect(result.statusSymbol).toBe("x");
    expect(result.body).toBe("Task content");
  });

  it("should throw an error if the line does not match the task regex", () => {
    const line = "Invalid line";

    expect(() => {
      splitCheckbox(line);
    }).toThrow("Line does not match task regex");
  });
});
