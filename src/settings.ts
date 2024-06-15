import { moment, App, Notice, PluginSettingTab, Setting } from "obsidian";
import Main from "./main";

export interface Settings {
  targetCssClasses: string[];
  timeFormat: string;
  separator: string;
  insertDate: boolean;
  dateFormat: string;
  enableDoingStatus: boolean;
  disableDoingStatusForSubTasks: boolean;
  autoIncrementOnSameTime: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  targetCssClasses: ["checkbox-time-tracker", "ctt"],
  timeFormat: "HH:mm",
  separator: "-",
  insertDate: false,
  dateFormat: "YYYY-MM-DD",
  enableDoingStatus: false,
  disableDoingStatusForSubTasks: false,
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
            this.display();
          })
      );

    const timeFormatSettingEl = new Setting(containerEl)
      .setName("Time format")
      .setDesc("The format of the time to insert. (default: HH:mm)");

    timeFormatSettingEl.addMomentFormat(
      (text) =>
        (text
          .setDefaultFormat("HH:mm")
          .setValue(this.plugin.settings.timeFormat)
          .onChange(async (value) => {
            // If value contains spaces, an error will be generated.
            if (value.includes(" ")) {
              timeFormatSettingEl.controlEl.addClass("setting-error");
              new Notice("Time format should not contain spaces.");
              return;
            }

            timeFormatSettingEl.controlEl.removeClass("setting-error");
            this.plugin.settings.timeFormat = value;
            await this.plugin.saveSettings();
          }).inputEl.onblur = () => {
          this.display();
        })
    );

    new Setting(containerEl)
      .setName("Enable date inserting")
      .setDesc("Insert the date in addition to the time.")
      .addToggle((tc) => {
        tc.setValue(this.plugin.settings.insertDate).onChange(async (value) => {
          this.plugin.settings.insertDate = value;
          await this.plugin.saveSettings();
          this.display();
        });
      });

    if (this.plugin.settings.insertDate) {
      const dateFormatSettingEl = new Setting(containerEl)
        .setName("Date format")
        .setDesc("The format of the date to insert. (default: YYYY-MM-DD)");

      dateFormatSettingEl.addMomentFormat(
        (text) =>
          (text
            .setDefaultFormat("HH:mm")
            .setValue(this.plugin.settings.dateFormat)
            .onChange(async (value) => {
              // If value contains spaces, an error will be generated.
              if (value.includes(" ")) {
                timeFormatSettingEl.controlEl.addClass("setting-error");
                new Notice("Time format should not contain spaces.");
                return;
              }

              timeFormatSettingEl.controlEl.removeClass("setting-error");
              this.plugin.settings.dateFormat = value;
              await this.plugin.saveSettings();
            }).inputEl.onblur = () => {
            this.display();
          })
      );
    }

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
              this.plugin.settings.disableDoingStatusForSubTasks = false;
            }

            await this.plugin.saveSettings();
            this.display();
          }
        );
      });
    if (this.plugin.settings.enableDoingStatus) {
      const separatorEl = new Setting(containerEl).setName("Separator");

      const separatorDesc = document.createDocumentFragment();
      separatorDesc.append(
        "Separator between start time and end time. (default: -)",
        separatorDesc.createEl("br"),
        separatorDesc.createEl("em", {
          text: "The following special characters are not allowed: ^ $ * + ? . [ ] { } | \\",
        })
      );
      separatorEl.setDesc(separatorDesc);

      separatorEl.addText(
        (text) =>
          (text
            .setPlaceholder("-")
            .setValue(this.plugin.settings.separator)
            .onChange(async (value) => {
              const noAlloedChars = /[$*+?.|()\\[\]{}]/;
              if (noAlloedChars.test(value)) {
                separatorEl.controlEl.addClass("setting-error");
                new Notice("Separator should not contain special characters.");
                this.plugin.settings.separator = value.replaceAll(
                  noAlloedChars,
                  ""
                );
                await this.plugin.saveSettings();
                return;
              }

              this.plugin.settings.separator = value;
              await this.plugin.saveSettings();
            }).inputEl.onblur = () => {
            this.display();
          })
      );
    }

    if (this.plugin.settings.enableDoingStatus) {
      new Setting(containerEl)
        .setName("Disable doing status for sub tasks")
        .setDesc(
          "Turn this on if you don't want to use the Doing status for subtasks (indented checkboxes)"
        )
        .addToggle((tc) => {
          tc.setValue(
            this.plugin.settings.disableDoingStatusForSubTasks
          ).onChange(async (value) => {
            this.plugin.settings.disableDoingStatusForSubTasks = value;
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

    // @ts-ignore
    const start = moment();
    // @ts-ignore
    const end = moment().add(1, "hour");

    const previewText = this.plugin.settings.insertDate
      ? `${end.format(this.plugin.settings.dateFormat)} ${end.format(
          this.plugin.settings.timeFormat
        )}`
      : `${end.format(this.plugin.settings.timeFormat)}`;

    const previewTextDoing = this.plugin.settings.insertDate
      ? `${start.format(this.plugin.settings.dateFormat)} ${start.format(
          this.plugin.settings.timeFormat
        )}${this.plugin.settings.separator}${end.format(
          this.plugin.settings.dateFormat
        )} ${end.format(this.plugin.settings.timeFormat)}`
      : `${start.format(this.plugin.settings.timeFormat)}${
          this.plugin.settings.separator
        }${end.format(this.plugin.settings.timeFormat)}`;

    const desc = containerEl.createEl("p", {
      text: "Preview inserted datetime: ",
      cls: "inserted-preview",
    });
    desc.createEl("span", {
      text: this.plugin.settings.enableDoingStatus
        ? previewTextDoing
        : previewText,
    });
  }
}
