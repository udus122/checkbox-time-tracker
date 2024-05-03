import { Plugin } from "obsidian";

import { newLivePreviewExtension } from "./LivePreview";
import { createCommands } from "./commands";

interface Settings {
  mySetting: string;
}

const DEFAULT_SETTINGS: Settings = {
  mySetting: "default",
};

export default class CSVTaskTracker extends Plugin {
  settings: Settings;

  async onload() {
    await this.loadSettings();
    this.registerEditorExtension(newLivePreviewExtension());

    createCommands().forEach((command) => {
      this.addCommand(command);
    });
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
