// import { moment } from "obsidian";
import moment from "moment";

import { Status, StatusType } from "./Status";
import { TaskInput } from "./TaskInput";
import { Task } from "./Task";

describe("Task", () => {
  describe("fromTodoInput", () => {
    it("should create a Task object from a TaskInput object with TODO status", () => {
      const taskInput = new TaskInput({
        indentation: "  ",
        listMarker: "-",
        statusSymbol: Status.makeTodo().symbol,
        status: Status.makeTodo(),
        content: "Task content",
        start: {
          time: moment("2022-01-01 10:00"),
          estimation: moment("2022-01-01 09:00"),
        },
        end: {
          time: moment("2022-01-01 12:00"),
          estimation: moment("2022-01-01 13:00"),
        },
        duration: {
          time: moment.duration(2, "hours"),
          estimation: moment.duration(1, "hour"),
        },
      });

      const task = Task.fromTodoInput(taskInput);

      expect(task.indentation).toBe("  ");
      expect(task.listMarker).toBe("-");
      expect(task.status.type).toBe(StatusType.TODO);
      expect(task.content).toBe("Task content");
      expect(task.start?.fact?.format("YYYY-MM-DD HH:mm")).toBe(
        "2022-01-01 10:00"
      );
      expect(task.start?.plan?.format("YYYY-MM-DD HH:mm")).toBe(
        "2022-01-01 09:00"
      );
      expect(task.end?.fact?.format("YYYY-MM-DD HH:mm")).toBe(
        "2022-01-01 12:00"
      );
      expect(task.end?.plan?.format("YYYY-MM-DD HH:mm")).toBe(
        "2022-01-01 13:00"
      );
      expect(task.duration?.fact?.asHours()).toBe(2);
      expect(task.duration?.plan?.asHours()).toBe(1);
    });
  });
});

describe("fromLine", () => {
  it("- [ ] 12:00,14:30,Task content,#tag,comment", () => {
    const line = "- [ ] 12:00,14:30,Task content,#tag,comment";
    const task = Task.fromLine(line);

    expect(task).toBeInstanceOf(Task);
    expect(task!.indentation).toBe("");
    expect(task!.listMarker).toBe("-");
    expect(task!.status.type).toBe(StatusType.TODO);
    expect(task!.content).toBe("Task content,#tag,comment");
    expect(task!.start!.fact).toBeUndefined();
    expect(task!.start!.plan).toEqual(moment("12:00", "HH:mm"));
    expect(task!.end!.fact).toBeUndefined();
    expect(task!.end!.plan).toEqual(moment("14:30", "HH:mm"));
    expect(task!.duration!.fact).toBeUndefined();
    expect(task!.duration!.plan).toBeUndefined();
  });

  it("  - [ ] 12:00,14:30,2:30,Task content,#tag,comment", () => {
    const line = "  - [ ] 12:00,14:30,2:30,Task content,#tag,comment";
    const task = Task.fromLine(line);

    expect(task).toBeInstanceOf(Task);
    expect(task!.indentation).toBe("  ");
    expect(task!.listMarker).toBe("-");
    expect(task!.status.type).toBe(StatusType.TODO);
    expect(task!.content).toBe("Task content,#tag,comment");
    expect(task!.start!.fact).toBeUndefined();
    expect(task!.start!.plan).toEqual(moment("12:00", "HH:mm"));
    expect(task!.end!.fact).toBeUndefined();
    expect(task!.end!.plan).toEqual(moment("14:30", "HH:mm"));
    expect(task!.duration!.fact).toBeUndefined();
    expect(task!.duration!.plan).toEqual(moment.duration("2:30"));
  });

  it("- [ ] 12:05(12:00),14:25(14:30),02:20(2:30),Task content,#tag,comment", () => {
    const line =
      "- [ ] 12:05(12:00),14:25(14:30),02:20(2:30),Task content,#tag,comment";
    const task = Task.fromLine(line);

    expect(task).toBeInstanceOf(Task);
    expect(task!.indentation).toBe("");
    expect(task!.listMarker).toBe("-");
    expect(task!.status.type).toBe(StatusType.TODO);
    expect(task!.content).toBe("Task content,#tag,comment");
    expect(task!.start!.fact).toEqual(moment("12:05", "HH:mm"));
    expect(task!.start!.plan).toEqual(moment("12:00", "HH:mm"));
    expect(task!.end!.fact).toEqual(moment("14:25", "HH:mm"));
    expect(task!.end!.plan).toEqual(moment("14:30", "HH:mm"));
    expect(task!.duration!.fact).toEqual(moment.duration("2:20"));
    expect(task!.duration!.plan).toEqual(moment.duration("2:30"));
  });

  it("- [/] 12:05(12:00),14:25(14:30),02:20(2:30),Task content,#tag,comment", () => {
    const line =
      "- [/] 12:05(12:00),14:25(14:30),02:20(2:30),Task content,#tag,comment";
    const task = Task.fromLine(line);

    expect(task).toBeInstanceOf(Task);
    expect(task!.indentation).toBe("");
    expect(task!.listMarker).toBe("-");
    expect(task!.status.type).toBe(StatusType.DOING);
    expect(task!.content).toBe("Task content,#tag,comment");
    expect(task!.start!.fact).toEqual(moment("12:05", "HH:mm"));
    expect(task!.start!.plan).toEqual(moment("12:00", "HH:mm"));
    expect(task!.end!.fact).toEqual(moment("14:25", "HH:mm"));
    expect(task!.end!.plan).toEqual(moment("14:30", "HH:mm"));
    expect(task!.duration!.fact).toEqual(moment.duration("2:20"));
    expect(task!.duration!.plan).toEqual(moment.duration("2:30"));
  });

  it("- [/] 12:05,Task content,#tag,comment", () => {
    const line = "- [/] 12:05,Task content,#tag,comment";
    const task = Task.fromLine(line);

    expect(task).toBeInstanceOf(Task);
    expect(task!.indentation).toBe("");
    expect(task!.listMarker).toBe("-");
    expect(task!.status.type).toBe(StatusType.DOING);
    expect(task!.content).toBe("Task content,#tag,comment");
    expect(task!.start!.fact).toEqual(moment("12:05", "HH:mm"));
    expect(task!.start!.plan).toBeUndefined();
    expect(task!.end!.fact).toBeUndefined();
    expect(task!.end!.plan).toBeUndefined();
    expect(task!.duration!.fact).toBeUndefined();
    expect(task!.duration!.plan).toBeUndefined();
  });

  it("- [x] 12:05(12:00),14:25(14:30),02:20(2:30),Task content,#tag,comment", () => {
    const line =
      "- [x] 12:05(12:00),14:25(14:30),02:20(2:30),Task content,#tag,comment";
    const task = Task.fromLine(line);

    expect(task).toBeInstanceOf(Task);
    expect(task!.indentation).toBe("");
    expect(task!.listMarker).toBe("-");
    expect(task!.status.type).toBe(StatusType.DONE);
    expect(task!.content).toBe("Task content,#tag,comment");
    expect(task!.start!.fact).toEqual(moment("12:05", "HH:mm"));
    expect(task!.start!.plan).toEqual(moment("12:00", "HH:mm"));
    expect(task!.end!.fact).toEqual(moment("14:25", "HH:mm"));
    expect(task!.end!.plan).toEqual(moment("14:30", "HH:mm"));
    expect(task!.duration!.fact).toEqual(moment.duration("2:20"));
    expect(task!.duration!.plan).toEqual(moment.duration("2:30"));
  });

  it("- [x] 12:05,14:25,Task content,#tag,comment", () => {
    const line = "- [x] 12:05,14:25,Task content,#tag,comment";
    const task = Task.fromLine(line);

    expect(task).toBeInstanceOf(Task);
    expect(task!.indentation).toBe("");
    expect(task!.listMarker).toBe("-");
    expect(task!.status.type).toBe(StatusType.DONE);
    expect(task!.content).toBe("Task content,#tag,comment");
    expect(task!.start!.fact).toEqual(moment("12:05", "HH:mm"));
    expect(task!.start!.plan).toBeUndefined();
    expect(task!.end!.fact).toEqual(moment("14:25", "HH:mm"));
    expect(task!.end!.plan).toBeUndefined();
    expect(task!.duration!.fact).toBeUndefined();
    expect(task!.duration!.plan).toBeUndefined();
  });

  it("Invalid line", () => {
    const line = "Invalid line";
    expect(() => {
      Task.fromLine(line);
    }).toThrow("Line does not match task regex");
  });
});

describe("toggle", () => {
  it("should toggle the status of a TODO task and update the start time if not provided", () => {
    const task = new Task({
      status: Status.makeTodo(),
      content: "Task content",
    });

    const toggledTask = task.toggle(false);

    expect(toggledTask.status.type).toBe(StatusType.DOING);
    expect(toggledTask.start?.fact).toBeDefined();
    expect(toggledTask.start?.plan).toBeUndefined();
  });

  it("should toggle the status of a DOING task and update the end time if not provided", () => {
    const task = new Task({
      status: Status.makeDoing(),
      content: "Task content",
    });

    const toggledTask = task.toggle(false);

    expect(toggledTask.status.type).toBe(StatusType.DONE);
    expect(toggledTask.end?.fact).toBeDefined();
    expect(toggledTask.end?.plan).toBeUndefined();
  });

  it("should cancel a task if isCancell is true", () => {
    const task = new Task({
      status: Status.makeTodo(),
      content: "Task content",
    });

    const cancelledTask = task.toggle(true);

    expect(cancelledTask.status.type).toBe(StatusType.CANCELLED);
  });
});

describe("toString", () => {
  it("All properties", () => {
    const task = new Task({
      status: Status.makeTodo(),
      content: "Task content",
      start: {
        fact: moment("10:00", "HH:mm"),
        plan: moment("09:00", "HH:mm"),
      },
      end: {
        fact: moment("12:00", "HH:mm"),
        plan: moment("13:00", "HH:mm"),
      },
      duration: {
        fact: moment.duration("2:00"),
        plan: moment.duration("1:00"),
      },
    });

    const expectedString =
      "- [ ] 10:00(09:00),12:00(13:00),2:0(1:0),Task content";
    expect(task.toString()).toBe(expectedString);
  });

  it("No properties", () => {
    const task = new Task({
      status: Status.makeTodo(),
      content: "Task content",
    });

    const expectedString = "- [ ] ,,,Task content";
    expect(task.toString()).toBe(expectedString);
  });
});
