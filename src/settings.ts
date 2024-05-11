import { App, PluginSettingTab, Setting } from "obsidian";
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

    new Setting(containerEl)
      .setName("開始時刻と終了時刻が同じ場合に終了時刻をインクリメントする")
      .setDesc(
        "Day Planerで、開始時刻と終了時刻が同じ場合、durationがデフォルトのものになってしまうことを避けるために使う"
      )
      .addToggle((tc) => {
        tc.setValue(this.plugin.settings.autoIncrementOnSameTime).onChange(
          async (value) => {
            this.plugin.settings.autoIncrementOnSameTime = value;
            await this.plugin.saveSettings();
          }
        );
      });
  }
}
