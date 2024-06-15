import { Command, Editor, Notice } from "obsidian";

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

        const taskOp = new taskOperations(settings);
        const task = taskOp.parseLine(lineContent);

        if (!task) {
          new Notice("No task found");
          return;
        }

        try {
          const toggled = taskOp.toggleTask(task);

          editor.setLine(line, taskOp.formatTask(toggled));
          editor.setCursor(line, ch);
        } catch (e) {
          new Notice(e.message);
        }
      },
    },
    {
      id: "duplicate-as-new-task",
      name: "Duplicate as new task",
      icon: "copy-check",
      editorCallback: (editor: Editor) => {
        const { line, ch } = editor.getCursor();
        const lineContent = editor.getLine(line);

        const taskOp = new taskOperations(settings);
        const task = taskOp.parseLine(lineContent);

        if (!task) {
          new Notice("No task found");
          return;
        }

        try {
          const taskOp = new taskOperations(settings);
          const duplicated = taskOp.duplicateTask(task);

          editor.replaceRange("\n" + taskOp.formatTask(duplicated), {
            line,
            ch: lineContent.length,
          });
          editor.setCursor(line, ch);
        } catch (e) {
          new Notice(e.message);
        }
      },
    },
    {
      id: "end-and-duplicate-task",
      name: "End current task and insert duplicated on the next line",
      icon: "check-check",
      editorCallback: (editor: Editor) => {
        const { line, ch } = editor.getCursor();

        const lineContent = editor.getLine(line);

        const taskOp = new taskOperations(settings);
        const task = taskOp.parseLine(lineContent);
        if (!task) {
          new Notice("No task found");
          return;
        }

        try {
          const taskOp = new taskOperations(settings);

          const ended = taskOp.endTask(task);
          editor.setLine(line, taskOp.formatTask(ended));

          const duplicated = taskOp.duplicateTask(ended);

          editor.replaceRange("\n" + taskOp.formatTask(duplicated), {
            line,
            ch: editor.getLine(line).length,
          });
          editor.setCursor(line, ch);
        } catch (e) {
          new Notice(e.message);
        }
      },
    },
  ];
}
