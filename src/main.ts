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
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
