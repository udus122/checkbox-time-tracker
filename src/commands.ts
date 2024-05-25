import { Command, Editor, Notice } from "obsidian";
import { Task } from "./Task";
import { taskOperations } from "./operations";
import { Settings } from "./settings";

export function createCommands(settings: Settings): Command[] {
  return [
    {
      id: "cycle-task-status",
      name: "Cycle task status",
      icon: "check-in-circle",
      editorCallback: (editor: Editor) => {
        const { line, ch } = editor.getCursor();

        const lineContent = editor.getLine(line);

        const task = Task.fromLine(lineContent);

        if (!task) {
          new Notice("No task found");
          return;
        }

        const taskOp = new taskOperations(settings);

        const toggled = taskOp.toggleTask(task);

        editor.setLine(line, toggled.toString());
        editor.setCursor(line, ch);
      },
    },
    {
      id: "duplicate-as-new-task",
      name: "Duplicate as new task",
      icon: "copy-check",
      editorCallback: (editor: Editor) => {
        const { line, ch } = editor.getCursor();
        const lineContent = editor.getLine(line);

        const task = Task.fromLine(lineContent);

        if (!task) {
          new Notice("No task found");
          return;
        }

        const taskOp = new taskOperations(settings);
        const duplicated = taskOp.duplicateTask(task);

        editor.replaceRange("\n" + duplicated.toString(), {
          line,
          ch: lineContent.length,
        });
        editor.setCursor(line, ch);
      },
    },
  ];
}
