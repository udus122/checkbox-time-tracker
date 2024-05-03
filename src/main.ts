import { newLivePreviewExtension } from "./LivePreview";
import { Plugin } from "obsidian";

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
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
