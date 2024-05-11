// ref. https://github.com/sytone/obsidian-tasks/blob/main/src/LivePreviewExtension.ts
import { EditorView, PluginValue } from "@codemirror/view";

import { Task } from "./Task";
import { Settings } from "./settings";
import { taskOperations } from "./operations";

export class LivePreviewExtension implements PluginValue {
  private readonly view: EditorView;
  private readonly settings: Settings;

  constructor(view: EditorView, settings: Settings) {
    this.view = view;
    this.settings = settings;

    this.handleClickEvent = this.handleClickEvent.bind(this);
    this.view.dom.addEventListener("click", this.handleClickEvent);
  }

  public destroy(): void {
    this.view.dom.removeEventListener("click", this.handleClickEvent);
  }

  private handleClickEvent(event: MouseEvent): boolean {
    const { target } = event;

    // Only handle checkbox clicks.
    if (
      !target ||
      !(target instanceof HTMLInputElement) ||
      target.type !== "checkbox"
    ) {
      return false;
    }

    const { state } = this.view;
    const position = this.view.posAtDOM(target as Node);
    const line = state.doc.lineAt(position);
    const task = Task.fromLine(line.text);

    // Only handle checkboxes of tasks.
    if (!task) {
      return false;
    }

    // We need to prevent default so that the checkbox is only handled by us and not obsidian.
    event.preventDefault();

    const taskOp = new taskOperations(this.settings);

    // Clicked on a task's checkbox. Toggle the task and set it.
    // Shift-click to cancel a task.
    const toggled = taskOp.toggleTask(task);

    // Creates a CodeMirror transaction in order to update the document.
    const transaction = state.update({
      changes: {
        from: line.from,
        to: line.to,
        insert: toggled.toString(),
      },
    });
    this.view.dispatch(transaction);

    // Dirty workaround.
    // While the code in this method properly updates the `checked` state
    // of the target checkbox, some Obsidian internals revert the state.
    // This means that the checkbox would remain in its original `checked`
    // state (`true` or `false`), even though the underlying document
    // updates correctly.
    // As a "fix", we set the checkbox's `checked` state *again* after a
    // timeout to revert Obsidian's wrongful reversal.
    const desiredCheckedStatus = target.checked;
    setTimeout(() => {
      target.checked = desiredCheckedStatus;
    }, 1);

    return true;
  }
}
