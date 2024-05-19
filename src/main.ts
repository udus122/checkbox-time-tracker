import { Plugin } from "obsidian";
import { ViewPlugin } from "@codemirror/view";

import { createCommands } from "./commands";
import { DEFAULT_SETTINGS, SettingTab, Settings } from "./settings";
import { LivePreviewExtension } from "./LivePreview";

export default class Main extends Plugin {
  settings: Settings;

  async onload() {
    await this.loadSettings();

    this.addSettingTab(new SettingTab(this.app, this));

    this.registerEditorExtension(
      ViewPlugin.define((view) => new LivePreviewExtension(view, this.settings))
    );

    createCommands(this.settings).forEach((command) => {
      this.addCommand(command);
    });

    const styleElement = document.createElement("style");
    styleElement.id = "checkbox-time-tracker-styles";
    styleElement.textContent = `${this.settings.targetCssClasses
      .map((cn) => `.${cn}`)
      .join(", ")} {
        .HyperMD-task-line[data-task="x"] {
          /* Disable the click event to prevent the visual check from being removed when clicking multiple times. */
          /* ref. https://github.com/obsidian-tasks-group/obsidian-tasks/issues/2389#issuecomment-1794328100 */
          pointer-events: none;
      }
    `;
    document.head.appendChild(styleElement);
  }

  onunload() {
    const styleElement = document.getElementById(
      "checkbox-time-tracker-styles"
    );
    if (styleElement) {
      styleElement.remove();
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
