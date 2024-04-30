import { newLivePreviewExtension } from "./LivePreview";
import { Plugin } from "obsidian";

// Remember to rename these classes and interfaces!

interface TascChuteObsidianSettings {
  mySetting: string;
}

const DEFAULT_SETTINGS: TascChuteObsidianSettings = {
  mySetting: "default",
};

export default class TascChuteObsidian extends Plugin {
  settings: TascChuteObsidianSettings;

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
