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
      .setName("CSS classes for track")
      .setDesc(
        "Specify the CSS class of the element to which the timer applies. If you specify multiple classes, separate them with spaces. There is no need to start with a dot (.)."
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
      .setName("Enable doing status")
      .setDesc(
        `Adds Doing(In Progress) to the status. The symbol is "/".
        So, when you click a checkbox, it will switch like this: ex. [ ] -> [/] -> [x].
        A custom theme or CSS snippet may be required to display the symbols properly.`
      )
      .addToggle((tc) => {
        tc.setValue(this.plugin.settings.enableDoingStatus).onChange(
          async (value) => {
            this.plugin.settings.enableDoingStatus = value;

            // If this option is disabled, DisableDoingStatusForSubTasks should be disabled too.
            if (!value) {
              this.plugin.settings.DisableDoingStatusForSubTasks = false;
            }

            await this.plugin.saveSettings();
            this.display();
          }
        );
      });

    if (this.plugin.settings.enableDoingStatus) {
      new Setting(containerEl)
        .setName("Disable doing status for sub tasks")
        .setDesc(
          "Turn this on if you don't want to use the Doing status for subtasks (indented checkboxes)"
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

    if (this.plugin.settings.enableDoingStatus) {
      new Setting(containerEl)
        .setName(
          "Enable auto increment when end time is the same as start time"
        )
        .setDesc(
          "If the start and end time are the same, delay the end time by 1 minute."
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
}
