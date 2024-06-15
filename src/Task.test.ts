import moment from "moment";

import { Status, StatusType } from "./Status";
import { Task } from "./Task";

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
