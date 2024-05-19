import { App, PluginSettingTab, Setting } from "obsidian";
import Main from "./main";

export interface Settings {
  autoIncrementOnSameTime: boolean;
  targetCssClasses: string[];
}

export const DEFAULT_SETTINGS: Settings = {
  autoIncrementOnSameTime: false,
  targetCssClasses: ["checkbox-time-tracker", "ctt"],
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

    new Setting(containerEl)
      .setName("ターゲットのCSSクラス")
      .setDesc(
        "タイマーを適用する要素のCSSクラスを指定します。複数指定する場合はスペース区切りで指定してください。先頭に.(ドット)は不要です"
      )
      .addTextArea((text) =>
        text
          .setPlaceholder("")
          .setValue(this.plugin.settings.targetCssClasses.join(" "))
          .onChange(async (value) => {
            this.plugin.settings.targetCssClasses = value.split(/\s+|\n+/);
            await this.plugin.saveSettings();
          })
      );
  }
}
