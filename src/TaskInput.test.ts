import moment from "moment";
import { TaskInput } from "./TaskInput";
import { Status } from "./Status";

describe("parseCheckbox", () => {
  it("checked checkbox", () => {
    const line = "- [x] Task";
    const { indentation, listMarker, statusSymbol, body } =
      TaskInput.splitCheckbox(line);
    expect(indentation).toBe("");
    expect(listMarker).toBe("-");
    expect(statusSymbol).toBe("x");
    expect(body).toBe("Task");
  });

  it("uncheckd checkbox", () => {
    const line = "- [ ] Task";
    const { indentation, listMarker, statusSymbol, body } =
      TaskInput.splitCheckbox(line);
    expect(indentation).toBe("");
    expect(listMarker).toBe("-");
    expect(statusSymbol).toBe(" ");
    expect(body).toBe("Task");
  });

  it("not checkbox (bullet list)", () => {
    const line = "- Task";
    expect(() => {
      TaskInput.splitCheckbox(line);
    }).toThrow("Line does not match task regex");
  });
});

describe("parseCheckboxComponents", () => {
  it("should parse checked checkbox components", () => {
    const line = "- [x] Task";
    const { indentation, listMarker, statusSymbol, status, body } =
      TaskInput.parseCheckboxComponents(line);
    expect(indentation).toBe("");
    expect(listMarker).toBe("-");
    expect(statusSymbol).toBe("x");
    expect(status).toEqual(Status.makeDone());
    expect(body).toBe("Task");
  });

  it("should parse unchecked checkbox components", () => {
    const line = "- [ ] Task";
    const { indentation, listMarker, statusSymbol, status, body } =
      TaskInput.parseCheckboxComponents(line);
    expect(indentation).toBe("");
    expect(listMarker).toBe("-");
    expect(statusSymbol).toBe(" ");
    expect(status).toEqual(Status.makeTodo());
    expect(body).toBe("Task");
  });

  it("should throw an error for non-checkbox line", () => {
    const line = "- Task";
    expect(() => {
      TaskInput.parseCheckboxComponents(line);
    }).toThrow("Line does not match task regex");
  });
});

describe("parseTime", () => {
  it("HH:mm: 見積か実績かを明示しない", () => {
    const time = "12:05";
    const result = TaskInput.parseTaskTimeInput(time);
    expect(result!.time).toBe("12:05");
    expect(result!.estimation).toBeUndefined();
  });

  it("(HH:mm): 見積を明示", () => {
    const time = "(12:00)";
    const result = TaskInput.parseTaskTimeInput(time);
    expect(result!.time).toBeUndefined();
    expect(result!.estimation).toBe("12:00");
  });

  it("HH:mm(HH:mm): 実績と見積、両方存在", () => {
    const time = "12:05(12:00)";
    const result = TaskInput.parseTaskTimeInput(time);
    expect(result!.time).toBe("12:05");
    expect(result!.estimation).toBe("12:00");
  });

  it("空文字列", () => {
    const time = "";
    const result = TaskInput.parseTaskTimeInput(time);
    expect(result!.time).toBeUndefined();
    expect(result!.estimation).toBeUndefined();
  });

  it("時刻の前後にスペースがあってもマッチ", () => {
    const time = " 12:05 ";
    const result = TaskInput.parseTaskTimeInput(time);
    expect(result!.time).toBe("12:05");
  });

  it("時刻の前後にスペースがあってもマッチ", () => {
    const time = " (   12:05   ) ";
    const result = TaskInput.parseTaskTimeInput(time);
    expect(result!.estimation).toBe("12:05");
  });

  it("不正な文字列1", () => {
    const time = "12:00 12:00";
    const result = TaskInput.parseTaskTimeInput(time);
    expect(result).toBeNull();
  });

  it("不正な文字列2", () => {
    const time = "全く関係ない文字列";
    const result = TaskInput.parseTaskTimeInput(time);
    expect(result).toBeNull();
  });
});

describe("parseTask", () => {
  it("(3列)開始,終了,時間,タイトル", () => {
    const body =
      "12:00,14:30,2:30,タスクのタイトル,タグ(オプショナル),メモ(オプショナル)";
    const result = TaskInput.parseCheckboxBody(body);
    expect(result.start).toEqual({
      time: moment("12:00", "HH:mm"),
      estimation: undefined,
    });
    expect(result.end).toEqual({
      time: moment("14:30", "HH:mm"),
      estimation: undefined,
    });
    expect(result.duration).toEqual({
      time: moment.duration("2:30"),
      estimation: undefined,
    });
    expect(result.content).toEqual(
      "タスクのタイトル,タグ(オプショナル),メモ(オプショナル)"
    );
  });

  it("(3列) (開始),(終了),(時間),タイトル", () => {
    const body =
      "(12:00),(14:30),(2:30),タスクのタイトル,タグ(オプショナル),メモ(オプショナル)";
    const result = TaskInput.parseCheckboxBody(body);
    expect(result.start).toEqual({
      time: undefined,
      estimation: moment("12:00", "HH:mm"),
    });
    expect(result.end).toEqual({
      time: undefined,
      estimation: moment("14:30", "HH:mm"),
    });
    expect(result.duration).toEqual({
      time: undefined,
      estimation: moment.duration("2:30"),
    });
    expect(result.content).toBe(
      "タスクのタイトル,タグ(オプショナル),メモ(オプショナル)"
    );
  });

  it("(3列) 開始(見積),終了(見積),時間(見積),タイトル", () => {
    const body =
      "12:05(12:00),14:25(14:30),2:20(02:30),タスクのタイトル,タグ(オプショナル),メモ(オプショナル)";
    const result = TaskInput.parseCheckboxBody(body);
    expect(result.start).toEqual({
      time: moment("12:05", "HH:mm"),
      estimation: moment("12:00", "HH:mm"),
    });
    expect(result.end).toEqual({
      time: moment("14:25", "HH:mm"),
      estimation: moment("14:30", "HH:mm"),
    });
    expect(result.duration).toEqual({
      time: moment.duration("2:20"),
      estimation: moment.duration("2:30"),
    });
    expect(result.content).toEqual(
      "タスクのタイトル,タグ(オプショナル),メモ(オプショナル)"
    );
  });

  it("(3列) 開始,終了,時間 (タスクの内容が未定義)", () => {
    const body = "12:00,14:30,2:30";
    const result = TaskInput.parseCheckboxBody(body);
    expect(result.start).toEqual({
      time: moment("12:00", "HH:mm"),
      estimation: undefined,
    });
    expect(result.end).toEqual({
      time: moment("14:30", "HH:mm"),
      estimation: undefined,
    });
    expect(result.duration).toEqual({
      time: moment.duration("2:30"),
      estimation: undefined,
    });
    expect(result.content).toEqual("");
  });

  it("(3列) 開始,終了,,タイトル", () => {
    const body =
      "12:05,14:25,,タスクのタイトル,タグ(オプショナル),メモ(オプショナル)";
    const result = TaskInput.parseCheckboxBody(body);
    expect(result.start).toEqual({
      time: moment("12:05", "HH:mm"),
      estimation: undefined,
    });
    expect(result.end).toEqual({
      time: moment("14:25", "HH:mm"),
      estimation: undefined,
    });
    expect(result.duration).toEqual({
      time: undefined,
      estimation: undefined,
    });
    expect(result.content).toEqual(
      "タスクのタイトル,タグ(オプショナル),メモ(オプショナル)"
    );
  });

  it("(3列) (開始),(終了),,タイトル", () => {
    const body =
      "(12:05),(14:25),,タスクのタイトル,タグ(オプショナル),メモ(オプショナル)";
    const result = TaskInput.parseCheckboxBody(body);
    expect(result.start).toEqual({
      time: undefined,
      estimation: moment("12:05", "HH:mm"),
    });
    expect(result.end).toEqual({
      time: undefined,
      estimation: moment("14:25", "HH:mm"),
    });
    expect(result.duration).toEqual({
      time: undefined,
      estimation: undefined,
    });
    expect(result.content).toEqual(
      "タスクのタイトル,タグ(オプショナル),メモ(オプショナル)"
    );
  });

  it("(3列) 開始(見積),終了(見積),,タイトル", () => {
    const body =
      "12:05(12:00),14:25(14:30),,タスクのタイトル,タグ(オプショナル),メモ(オプショナル)";
    const result = TaskInput.parseCheckboxBody(body);
    expect(result.start).toEqual({
      time: moment("12:05", "HH:mm"),
      estimation: moment("12:00", "HH:mm"),
    });
    expect(result.end).toEqual({
      time: moment("14:25", "HH:mm"),
      estimation: moment("14:30", "HH:mm"),
    });
    expect(result.duration).toEqual({
      time: undefined,
      estimation: undefined,
    });
    expect(result.content).toEqual(
      "タスクのタイトル,タグ(オプショナル),メモ(オプショナル)"
    );
  });

  it("(3列) 開始,,時間,タイトル", () => {
    const body =
      "12:05,,2:30,タスクのタイトル,タグ(オプショナル),メモ(オプショナル)";
    const result = TaskInput.parseCheckboxBody(body);
    expect(result.start).toEqual({
      time: moment("12:05", "HH:mm"),
      estimation: undefined,
    });
    expect(result.end).toEqual({
      time: undefined,
      estimation: undefined,
    });
    expect(result.duration).toEqual({
      time: moment.duration("2:30"),
      estimation: undefined,
    });
    expect(result.content).toEqual(
      "タスクのタイトル,タグ(オプショナル),メモ(オプショナル)"
    );
  });

  it("(3列) (開始),,(時間),タイトル", () => {
    const body =
      "(12:05),,(2:30),タスクのタイトル,タグ(オプショナル),メモ(オプショナル)";
    const result = TaskInput.parseCheckboxBody(body);
    expect(result.start).toEqual({
      time: undefined,
      estimation: moment("12:05", "HH:mm"),
    });
    expect(result.end).toEqual({
      time: undefined,
      estimation: undefined,
    });
    expect(result.duration).toEqual({
      time: undefined,
      estimation: moment.duration("2:30"),
    });
    expect(result.content).toEqual(
      "タスクのタイトル,タグ(オプショナル),メモ(オプショナル)"
    );
  });

  it("(3列) 開始(見積),,時間(見積),タイトル", () => {
    const body =
      "12:05(12:00),,2:20(2:30),タスクのタイトル,タグ(オプショナル),メモ(オプショナル)";
    const result = TaskInput.parseCheckboxBody(body);
    expect(result.start).toEqual({
      time: moment("12:05", "HH:mm"),
      estimation: moment("12:00", "HH:mm"),
    });
    expect(result.end).toEqual({
      time: undefined,
      estimation: undefined,
    });
    expect(result.duration).toEqual({
      time: moment.duration("2:20"),
      estimation: moment.duration("2:30"),
    });
    expect(result.content).toEqual(
      "タスクのタイトル,タグ(オプショナル),メモ(オプショナル)"
    );
  });

  it("(3列) ,終了,時間,タイトル", () => {
    const body = ",14:30,2:30,タイトル";
    const result = TaskInput.parseCheckboxBody(body);
    expect(result.start).toEqual({
      time: undefined,
      estimation: undefined,
    });
    expect(result.end).toEqual({
      time: moment("14:30", "HH:mm"),
      estimation: undefined,
    });
    expect(result.duration).toEqual({
      time: moment.duration("2:30"),
      estimation: undefined,
    });
    expect(result.content).toEqual("タイトル");
  });

  it("(3列) ,(終了),(時間),タイトル", () => {
    const body = ",(14:30),(2:30),タイトル";
    const result = TaskInput.parseCheckboxBody(body);
    expect(result.start).toEqual({
      time: undefined,
      estimation: undefined,
    });
    expect(result.end).toEqual({
      time: undefined,
      estimation: moment("14:30", "HH:mm"),
    });
    expect(result.duration).toEqual({
      time: undefined,
      estimation: moment.duration("2:30"),
    });
    expect(result.content).toEqual("タイトル");
  });

  it("(3列) ,終了(見積),時間(見積),タイトル", () => {
    const body = ",14:25(14:30),2:20(2:30),タイトル";
    const result = TaskInput.parseCheckboxBody(body);
    expect(result.start).toEqual({
      time: undefined,
      estimation: undefined,
    });
    expect(result.end).toEqual({
      time: moment("14:25", "HH:mm"),
      estimation: moment("14:30", "HH:mm"),
    });
    expect(result.duration).toEqual({
      time: moment.duration("2:20"),
      estimation: moment.duration("2:30"),
    });
    expect(result.content).toEqual("タイトル");
  });

  it("(3列) 開始,,,タイトル", () => {
    const body = "12:00,,,タイトル";
    const result = TaskInput.parseCheckboxBody(body);
    expect(result.start).toEqual({
      time: moment("12:00", "HH:mm"),
      estimation: undefined,
    });
    expect(result.end).toEqual({
      time: undefined,
      estimation: undefined,
    });
    expect(result.duration).toEqual({
      time: undefined,
      estimation: undefined,
    });
    expect(result.content).toEqual("タイトル");
  });

  it("(3列) (開始),,,タイトル", () => {
    const body = "(12:00),,,タイトル";
    const result = TaskInput.parseCheckboxBody(body);
    expect(result.start).toEqual({
      time: undefined,
      estimation: moment("12:00", "HH:mm"),
    });
    expect(result.end).toEqual({
      time: undefined,
      estimation: undefined,
    });
    expect(result.duration).toEqual({
      time: undefined,
      estimation: undefined,
    });
    expect(result.content).toEqual("タイトル");
  });

  it("(3列) 開始(見積),,,タイトル", () => {
    const body = "12:05(12:00),,,タイトル";
    const result = TaskInput.parseCheckboxBody(body);
    expect(result.start).toEqual({
      time: moment("12:05", "HH:mm"),
      estimation: moment("12:00", "HH:mm"),
    });
    expect(result.end).toEqual({
      time: undefined,
      estimation: undefined,
    });
    expect(result.duration).toEqual({
      time: undefined,
      estimation: undefined,
    });
    expect(result.content).toEqual("タイトル");
  });

  it("(3列) ,終了,,タイトル", () => {
    const body = ",14:30,,タイトル";
    const result = TaskInput.parseCheckboxBody(body);
    expect(result.start).toEqual({
      time: undefined,
      estimation: undefined,
    });
    expect(result.end).toEqual({
      time: moment("14:30", "HH:mm"),
      estimation: undefined,
    });
    expect(result.duration).toEqual({
      time: undefined,
      estimation: undefined,
    });
    expect(result.content).toEqual("タイトル");
  });

  it("(3列) ,(終了),,タイトル", () => {
    const body = ",(14:30),,タイトル";
    const result = TaskInput.parseCheckboxBody(body);
    expect(result.start).toEqual({
      time: undefined,
      estimation: undefined,
    });
    expect(result.end).toEqual({
      time: undefined,
      estimation: moment("14:30", "HH:mm"),
    });
    expect(result.duration).toEqual({
      time: undefined,
      estimation: undefined,
    });
    expect(result.content).toEqual("タイトル");
  });

  it("(3列) ,終了(見積),,タイトル", () => {
    const body = ",14:25(14:30),,タイトル";
    const result = TaskInput.parseCheckboxBody(body);
    expect(result.start).toEqual({
      time: undefined,
      estimation: undefined,
    });
    expect(result.end).toEqual({
      time: moment("14:25", "HH:mm"),
      estimation: moment("14:30", "HH:mm"),
    });
    expect(result.duration).toEqual({
      time: undefined,
      estimation: undefined,
    });
    expect(result.content).toEqual("タイトル");
  });

  it("(3列) ,,時間,タイトル", () => {
    const body = ",,2:30,タイトル";
    const result = TaskInput.parseCheckboxBody(body);
    expect(result.start).toEqual({
      time: undefined,
      estimation: undefined,
    });
    expect(result.end).toEqual({
      time: undefined,
      estimation: undefined,
    });
    expect(result.duration).toEqual({
      time: moment.duration("2:30"),
      estimation: undefined,
    });
    expect(result.content).toEqual("タイトル");
  });

  it("(3列) ,,(時間),タイトル", () => {
    const body = ",,(2:30),タイトル";
    const result = TaskInput.parseCheckboxBody(body);
    expect(result.start).toEqual({
      time: undefined,
      estimation: undefined,
    });
    expect(result.end).toEqual({
      time: undefined,
      estimation: undefined,
    });
    expect(result.duration).toEqual({
      time: undefined,
      estimation: moment.duration("2:30"),
    });
    expect(result.content).toEqual("タイトル");
  });

  it("(3列) ,,時間(見積),タイトル", () => {
    const body = ",,2:20(2:30),タイトル";
    const result = TaskInput.parseCheckboxBody(body);
    expect(result.start).toEqual({
      time: undefined,
      estimation: undefined,
    });
    expect(result.end).toEqual({
      time: undefined,
      estimation: undefined,
    });
    expect(result.duration).toEqual({
      time: moment.duration("2:20"),
      estimation: moment.duration("2:30"),
    });
    expect(result.content).toEqual("タイトル");
  });

  it("(2列) 開始,終了,タイトル", () => {
    const body = "12:00,14:30,タイトル";
    const result = TaskInput.parseCheckboxBody(body);
    expect(result.start).toEqual({
      time: moment("12:00", "HH:mm"),
      estimation: undefined,
    });
    expect(result.end).toEqual({
      time: moment("14:30", "HH:mm"),
      estimation: undefined,
    });
    expect(result.duration).toEqual(null);
    expect(result.content).toEqual("タイトル");
  });

  it("(2列) (開始),(終了),タイトル", () => {
    const body = "(12:00),(14:30),タイトル";
    const result = TaskInput.parseCheckboxBody(body);
    expect(result.start).toEqual({
      time: undefined,
      estimation: moment("12:00", "HH:mm"),
    });
    expect(result.end).toEqual({
      time: undefined,
      estimation: moment("14:30", "HH:mm"),
    });
    expect(result.duration).toEqual(null);
    expect(result.content).toEqual("タイトル");
  });

  it("(2列) 開始(見積),終了(見積),タイトル", () => {
    const body = "12:05(12:00),14:25(14:30),タイトル";
    const result = TaskInput.parseCheckboxBody(body);
    expect(result.start).toEqual({
      time: moment("12:05", "HH:mm"),
      estimation: moment("12:00", "HH:mm"),
    });
    expect(result.end).toEqual({
      time: moment("14:25", "HH:mm"),
      estimation: moment("14:30", "HH:mm"),
    });
    expect(result.duration).toEqual(null);
    expect(result.content).toEqual("タイトル");
  });

  it("(2列) ,終了,タイトル", () => {
    const body = ",14:25,タイトル,タグ(オプショナル),メモ(オプショナル)";
    const result = TaskInput.parseCheckboxBody(body);
    expect(result.start).toEqual({
      time: undefined,
      estimation: undefined,
    });
    expect(result.end).toEqual({
      time: moment("14:25", "HH:mm"),
      estimation: undefined,
    });
    expect(result.duration).toEqual(null);
    expect(result.content).toEqual(
      "タイトル,タグ(オプショナル),メモ(オプショナル)"
    );
  });

  it("(2列) ,(終了),タイトル", () => {
    const body = ",(14:30),タイトル,タグ(オプショナル),メモ(オプショナル)";
    const result = TaskInput.parseCheckboxBody(body);
    expect(result.start).toEqual({
      time: undefined,
      estimation: undefined,
    });
    expect(result.end).toEqual({
      time: undefined,
      estimation: moment("14:30", "HH:mm"),
    });
    expect(result.duration).toEqual(null);
    expect(result.content).toEqual(
      "タイトル,タグ(オプショナル),メモ(オプショナル)"
    );
  });

  it("(2列) ,終了(見積),タイトル", () => {
    const body = ",14:25(14:30),タイトル,タグ(オプショナル),メモ(オプショナル)";
    const result = TaskInput.parseCheckboxBody(body);
    expect(result.start).toEqual({
      time: undefined,
      estimation: undefined,
    });
    expect(result.end).toEqual({
      time: moment("14:25", "HH:mm"),
      estimation: moment("14:30", "HH:mm"),
    });
    expect(result.duration).toEqual(null);
    expect(result.content).toEqual(
      "タイトル,タグ(オプショナル),メモ(オプショナル)"
    );
  });

  it("(1列) 開始,タイトル", () => {
    const body = "12:05,タイトル,タグ(オプショナル),メモ(オプショナル)";
    const result = TaskInput.parseCheckboxBody(body);
    expect(result.start).toEqual({
      time: moment("12:05", "HH:mm"),
      estimation: undefined,
    });
    expect(result.end).toEqual(null);
    expect(result.duration).toEqual(null);
    expect(result.content).toEqual(
      "タイトル,タグ(オプショナル),メモ(オプショナル)"
    );
  });

  it("(1列) (開始),タイトル", () => {
    const body = "(12:00),タイトル,タグ(オプショナル),メモ(オプショナル)";
    const result = TaskInput.parseCheckboxBody(body);
    expect(result.start).toEqual({
      time: undefined,
      estimation: moment("12:00", "HH:mm"),
    });
    expect(result.end).toEqual(null);
    expect(result.duration).toEqual(null);
    expect(result.content).toEqual(
      "タイトル,タグ(オプショナル),メモ(オプショナル)"
    );
  });

  it("(1列) 開始(見積),タイトル", () => {
    const body = "12:05(12:00),タイトル,タグ(オプショナル),メモ(オプショナル)";
    const result = TaskInput.parseCheckboxBody(body);
    expect(result.start).toEqual({
      time: moment("12:05", "HH:mm"),
      estimation: moment("12:00", "HH:mm"),
    });
    expect(result.end).toEqual(null);
    expect(result.duration).toEqual(null);
    expect(result.content).toEqual(
      "タイトル,タグ(オプショナル),メモ(オプショナル)"
    );
  });

  it("(0列) タイトル", () => {
    const body = "タスクのタイトル,タグ(オプショナル),メモ(オプショナル)";
    const result = TaskInput.parseCheckboxBody(body);
    expect(result.start).toEqual(null);
    expect(result.end).toEqual(null);
    expect(result.duration).toEqual(null);
    expect(result.content).toEqual(
      "タスクのタイトル,タグ(オプショナル),メモ(オプショナル)"
    );
  });
});
