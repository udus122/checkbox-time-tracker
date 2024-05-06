import { Command, Editor, Notice } from "obsidian";
import { Task } from "./Task";

export function createCommands(): Command[] {
  return [
    {
      id: "cycle-task-status",
      name: "Cycle task status",
      hotkeys: [
        // cmd + shift + l
        {
          modifiers: ["Mod", "Shift"],
          key: "L",
        },
      ],
      icon: "circle-check-big",
      editorCallback: (editor: Editor) => {
        const { line, ch } = editor.getCursor();

        const lineContent = editor.getLine(line);

        const task = Task.fromLine(lineContent);

        if (!task) {
          new Notice("No task found");
          return;
        }

        const toggled = task.toggle();

        editor.setLine(line, toggled.toString());
        editor.setCursor(line, ch);
      },
    },
  ];
}
