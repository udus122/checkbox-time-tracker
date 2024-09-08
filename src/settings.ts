import { moment, App, Notice, PluginSettingTab, Setting } from "obsidian";
import Main from "./main";
import { taskOperations } from "./operations";
import { Task } from "./Task";
import { Status } from "./Status";

export interface Settings {
  targetCssClasses: string[];
  timeFormat: string;
  separator: string;
  enableDateInserting: boolean;
  dateFormat: string;
  omitEndDateOnSameDate: boolean;
  enableDoingStatus: boolean;
  disableDoingStatusForSubTasks: boolean;
  autoIncrementOnSameTime: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  targetCssClasses: ["checkbox-time-tracker", "ctt"],
  timeFormat: "HH:mm",
  separator: "-",
  enableDateInserting: false,
  dateFormat: "YYYY-MM-DD",
  omitEndDateOnSameDate: false,
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
        tc.setValue(this.plugin.settings.enableDateInserting).onChange(
          async (value) => {
            this.plugin.settings.enableDateInserting = value;
            await this.plugin.saveSettings();
            this.display();
          }
        );
      });

    if (this.plugin.settings.enableDateInserting) {
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
              const disallowedCharsRegex = /[$*+?.|()\\[\]{}]/;
              if (disallowedCharsRegex.test(value)) {
                separatorEl.controlEl.addClass("setting-error");
                new Notice("Separator should not contain special characters.");
                this.plugin.settings.separator = value.replaceAll(
                  disallowedCharsRegex,
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

    if (
      this.plugin.settings.enableDoingStatus &&
      this.plugin.settings.enableDateInserting
    ) {
      new Setting(containerEl)
        .setName("Omit end date on same date")
        .setDesc(
          "If the end date is the same as the start date, do not insert end date to avoid duplication."
        )
        .addToggle((tc) => {
          tc.setValue(this.plugin.settings.omitEndDateOnSameDate).onChange(
            async (value) => {
              this.plugin.settings.omitEndDateOnSameDate = value;
              await this.plugin.saveSettings();
              this.display();
            }
          );
        });
    }

    const taskOp = new taskOperations(this.plugin.settings);
    const TASK_SETTINGS = {
      indentation: "",
      listMarker: "-",
      checkboxBody: "",
      status: Status.Doing(),
      // @ts-ignore
      start: moment(),
      // @ts-ignore
      end: moment().add(1, "hour"),
      taskBody: "Example task",
    };

    const desc = containerEl.createEl("p", {
      text: "Preview inserted datetime: ",
      cls: "inserted-preview",
    });
    desc.createEl("span", {
      text: this.plugin.settings.enableDoingStatus
        ? taskOp.formatTask(
            new Task({
              ...TASK_SETTINGS,
              status: Status.Done(),
            })
          )
        : taskOp.formatTask(
            new Task({
              ...TASK_SETTINGS,
              status: Status.Done(),
              start: undefined,
            })
          ),
    });
  }
}
