import { App, PluginSettingTab } from "obsidian";
import Main from "./main";

export interface Settings {
  autoIncrementOnSameTime: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  autoIncrementOnSameTime: false,
};

export class SettingTab extends PluginSettingTab {
  plugin: Main;

  constructor(app: App, plugin: Main) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();
  }
}
