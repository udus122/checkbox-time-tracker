import moment from "moment";
import { Status, StatusType } from "./Status";
import { Task } from "./Task";

describe("splitCheckbox", () => {
  it("should split the checkbox line correctly", () => {
    const line = "  - [x] Task content";
    const result = Task.splitCheckbox(line);

    expect(result.indentation).toBe("  ");
    expect(result.listMarker).toBe("-");
    expect(result.statusSymbol).toBe("x");
    expect(result.body).toBe("Task content");
  });

  it("should throw an error if the line does not match the task regex", () => {
    const line = "Invalid line";

    expect(() => {
      Task.splitCheckbox(line);
    }).toThrow("Line does not match task regex");
  });
});

describe("fromLine", () => {
  it("- [ ] task content", () => {
    const body = "- [ ] task content";
    const result = Task.fromLine(body);

    expect(result?.start).toBeUndefined();
    expect(result?.end).toBeUndefined();
    expect(result?.taskBody).toBe("task content");
  });

  it("- [ ] 10:00-12:00(1h30m) task content", () => {
    const body = "- [ ] task content";
    const result = Task.fromLine(body);

    expect(result?.start).toBeUndefined();
    expect(result?.end).toBeUndefined();
    expect(result?.taskBody).toBe("task content");
  });

  it("- [/] 11:00 10:00-12:00(1h30m) task content", () => {
    const body = "- [/] 11:00 10:00-12:00(1h30m) task content";
    const result = Task.fromLine(body);

    expect(result?.start?.format("HH:mm")).toBe("11:00");
    expect(result?.end).toBeUndefined();
    expect(result?.taskBody).toBe("10:00-12:00(1h30m) task content");
  });

  it("- [/] 10:00-12:00(1h30m) task content", () => {
    const body = "- [/] 10:00-12:00(1h30m) task content";
    expect(() => {
      Task.fromLine(body);
    }).toThrow("Line does not match Doing regex");
  });

  it("- [/] 10:00 task content", () => {
    const body = "- [/] 10:00 task content";
    const result = Task.fromLine(body);

    expect(result?.start?.format("HH:mm")).toBe("10:00");
    expect(result?.end).toBeUndefined();
    expect(result?.taskBody).toBe("task content");
  });

  it("- [x] 10:00-12:00 task content", () => {
    const body = "- [x] 10:00-12:00 task content";
    const result = Task.fromLine(body);

    expect(result?.start?.format("HH:mm")).toBe("10:00");
    expect(result?.end?.format("HH:mm")).toBe("12:00");
    expect(result?.taskBody).toBe("task content");
  });

  it("- [x] 10:00-12:00 11:00-12:00(1h) task content", () => {
    const body = "- [x] 10:00-12:00 11:00-12:00(1h) task content";
    const result = Task.fromLine(body);

    expect(result?.start?.format("HH:mm")).toBe("10:00");
    expect(result?.end?.format("HH:mm")).toBe("12:00");
    expect(result?.taskBody).toBe("11:00-12:00(1h) task content");
  });

  it("- [x] 10:00 task content", () => {
    const body = "- [x] 10:00 task content";

    expect(() => {
      Task.fromLine(body);
    }).toThrow("Line does not match Done regex");
  });
});

describe("begin", () => {
  it("should return a new Task with status set to Doing and start time set to the provided time", () => {
    const task = new Task({
      indentation: "  ",
      listMarker: "-",
      checkboxBody: "Task content",
      status: Status.Todo(),
      start: undefined,
      end: undefined,
      taskBody: "Task content",
    });

    const startTime = moment("10:00", "HH:mm");
    const result = task.makeDoing(startTime);

    expect(result.status.type).toBe(StatusType.DOING);
    expect(result.start).toBe(startTime);
    expect(result.end).toBeUndefined();
    expect(result.taskBody).toBe(task.checkboxBody);
  });

  it("should return a new Task with status set to Doing and start time set to the current time if no time is provided", () => {
    const task = new Task({
      indentation: "  ",
      listMarker: "-",
      checkboxBody: "Task content",
      status: Status.Todo(),
      start: undefined,
      end: undefined,
      taskBody: "Task content",
    });

    const currentTime = moment();
    const result = task.makeDoing();

    expect(result.status.type).toBe(StatusType.DOING);
    expect(result.start?.isSameOrAfter(currentTime)).toBe(true);
    expect(result.end).toBeUndefined();
    expect(result.taskBody).toBe(task.checkboxBody);
  });
});

describe("finish", () => {
  it("should return a new Task with status set to Done and end time set to the provided time", () => {
    const task = new Task({
      indentation: "  ",
      listMarker: "-",
      checkboxBody: "Task content",
      status: Status.Doing(),
      start: moment("10:00", "HH:mm"),
      end: undefined,
      taskBody: "Task content",
    });

    const endTime = moment("12:00", "HH:mm");
    const result = task.makeDone(endTime);

    expect(result.status.type).toBe(StatusType.DONE);
    expect(result.end).toBe(endTime);
  });

  it("should return a new Task with status set to Done and end time set to the current time if no time is provided", () => {
    const task = new Task({
      indentation: "  ",
      listMarker: "-",
      checkboxBody: "Task content",
      status: Status.Doing(),
      start: moment("10:00", "HH:mm"),
      end: undefined,
      taskBody: "Task content",
    });

    const currentTime = moment();
    const result = task.makeDone();

    expect(result.status.type).toBe(StatusType.DONE);
    expect(result.end?.isSameOrAfter(currentTime)).toBe(true);
  });

  it("should return a new Task with status set to Done and end time set to the current time if no time is provided", () => {
    const task = new Task({
      indentation: "  ",
      listMarker: "-",
      checkboxBody: "Task content",
      status: Status.Doing(),
      start: moment("10:00", "HH:mm"),
      end: undefined,
      taskBody: "Task content",
    });

    const currentTime = moment();
    const result = task.makeDone();

    expect(result.status.type).toBe(StatusType.DONE);
    expect(result.end?.isSameOrAfter(currentTime)).toBe(true);
  });
});

// TODO: move to operations.test.ts
// describe("toggle", () => {
//   it("should return a new Task with status set to Doing and start time set to the provided start time if the current status is Todo", () => {
//     const task = new Task({
//       indentation: "  ",
//       listMarker: "-",
//       statusSymbol: " ",
//       checkboxBody: "Task content",
//       status: Status.Todo(),
//       start: undefined,
//       end: undefined,
//       taskBody: "Task content",
//     });

//     const startTime = moment("10:00", "HH:mm");
//     const result = task.toggle({ start_time: startTime });

//     expect(result.status.type).toBe(StatusType.DOING);
//     expect(result.start).toBe(startTime);
//     expect(result.end).toBeUndefined();
//     expect(result.taskBody).toBe(task.checkboxBody);
//   });

//   it("should return a new Task with status set to Done and end time set to the provided end time if the current status is Doing", () => {
//     const task = new Task({
//       indentation: "  ",
//       listMarker: "-",
//       statusSymbol: "x",
//       checkboxBody: "Task content",
//       status: Status.Doing(),
//       start: moment("10:00", "HH:mm"),
//       end: undefined,
//       taskBody: "Task content",
//     });

//     const endTime = moment("12:00", "HH:mm");
//     const result = task.toggle({ end_time: endTime });

//     expect(result.status.type).toBe(StatusType.DONE);
//     expect(result.end).toBe(endTime);
//   });

//   it("should return the same Task if the current status is Done", () => {
//     const task = new Task({
//       indentation: "  ",
//       listMarker: "-",
//       statusSymbol: "x",
//       checkboxBody: "Task content",
//       status: Status.Done(),
//       start: moment("10:00", "HH:mm"),
//       end: moment("12:00", "HH:mm"),
//       taskBody: "Task content",
//     });

//     const result = task.toggle({ start_time: moment(), end_time: moment() });

//     expect(result).toBe(task);
//   });
// });

describe("toString", () => {
  it("should return the string representation of the task with start and end times", () => {
    const task = new Task({
      indentation: "  ",
      listMarker: "-",
      checkboxBody: "Task content",
      status: Status.Done(),
      start: moment("10:00", "HH:mm"),
      end: moment("12:00", "HH:mm"),
      taskBody: "Task content",
    });

    const result = task.toString();

    expect(result).toBe("  - [x] 10:00-12:00 Task content");
  });

  it("should return the string representation of the task with only start time", () => {
    const task = new Task({
      indentation: "  ",
      listMarker: "-",
      checkboxBody: "Task content",
      status: Status.Done(),
      start: moment("10:00", "HH:mm"),
      end: undefined,
      taskBody: "Task content",
    });

    const result = task.toString();

    expect(result).toBe("  - [x] 10:00 Task content");
  });

  it("should return the string representation of the task without start and end times", () => {
    const task = new Task({
      indentation: "  ",
      listMarker: "-",
      checkboxBody: "Task content",
      status: Status.Done(),
      start: undefined,
      end: undefined,
      taskBody: "Task content",
    });

    const result = task.toString();
    expect(result).toBe("  - [x] Task content");
  });
});
