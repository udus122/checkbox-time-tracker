import { Plugin } from "obsidian";

import { newLivePreviewExtension } from "./LivePreview";
import { createCommands } from "./commands";
import { DEFAULT_SETTINGS, SettingTab, Settings } from "./settings";

export default class Main extends Plugin {
  settings: Settings;

  async onload() {
    await this.loadSettings();

    this.addSettingTab(new SettingTab(this.app, this));

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
