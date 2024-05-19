import { App, PluginSettingTab, Setting } from "obsidian";
import Main from "./main";

export interface Settings {
  targetCssClasses: string[];
  enableDoingStatus: boolean;
  DisableDoingStatusForSubTasks: boolean;
  autoIncrementOnSameTime: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  targetCssClasses: ["checkbox-time-tracker", "ctt"],
  enableDoingStatus: false,
  DisableDoingStatusForSubTasks: false,
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
      .setName("CSS Classes for Track")
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

    new Setting(containerEl)
      .setName("Enable Doing Status")
      .setDesc(
        "ステータスにDoing(進行中)を追加する。シンボルは`/`で表される。ex. [ ] -> [/] -> [x]"
      )
      .addToggle((tc) => {
        tc.setValue(this.plugin.settings.enableDoingStatus).onChange(
          async (value) => {
            this.plugin.settings.enableDoingStatus = value;
            await this.plugin.saveSettings();
          }
        );
      });

    if (this.plugin.settings.enableDoingStatus) {
      new Setting(containerEl)
        .setName("Disable Doing status for sub tasks")
        .setDesc(
          "サブタスク(インデントされたチェックボックス)でDoing(進行中)のステータスを使いたくない場合はONにする"
        )
        .addToggle((tc) => {
          tc.setValue(
            this.plugin.settings.DisableDoingStatusForSubTasks
          ).onChange(async (value) => {
            this.plugin.settings.DisableDoingStatusForSubTasks = value;
            await this.plugin.saveSettings();
          });
        });
    }

    new Setting(containerEl)
      .setName("Enable auto increment when end time is the same as start time")
      // Enable auto increment when end time is the same as start time
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
