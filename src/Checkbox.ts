import type { Duration, Moment } from "moment";
import { Status } from "./Status";

export type TimeInput = { time?: Moment; estimation?: Moment };
export type DurationInput = { time?: Duration; estimation?: Duration };

export class Checkbox {
  /** Match the indentation at the beginning of a line */
  static readonly INDENTATION_REGEX = /^(?<indentation>[\s\t]*)/;

  /** Matches - * and + list markers, or numbered list markers (eg 1.) */
  static readonly LIST_MARKER_REGEX = /(?<listMarker>[-*+])/;

  /** Matches a checkbox and saves the status character inside */
  static readonly CHECKBOX_MARKER_REGEX = /\[(?<statusSymbol>.)\]/u;

  /** Matches the rest of the task after the checkbox. */
  static readonly CHECKBOX_BODY_REGEX = / *(?<body>.*)/u;

  /**
   * Main regex for parsing a line. It matches the following:
   * - Indentation
   * - List marker
   * - Status character
   * - Body(Rest of task after checkbox markdown)
   */
  static readonly CHECKBOX_REGEX = new RegExp(
    Checkbox.INDENTATION_REGEX.source +
      Checkbox.LIST_MARKER_REGEX.source +
      " +" +
      Checkbox.CHECKBOX_MARKER_REGEX.source +
      Checkbox.CHECKBOX_BODY_REGEX.source,
    "u"
  );

  public readonly indentation: string;
  public readonly listMarker: string;
  public readonly statusSymbol: string;
  public readonly status: Status;
  public readonly body: string;

  constructor({
    indentation,
    listMarker,
    statusSymbol,
    body,
  }: {
    indentation: string;
    listMarker: string;
    statusSymbol: string;
    body: string;
  }) {
    this.indentation = indentation;
    this.listMarker = listMarker;
    this.statusSymbol = statusSymbol;
    this.status = Status.fromSymbol(statusSymbol);
    this.body = body;
  }

  public static fromLine(line: string): Checkbox {
    const { indentation, listMarker, statusSymbol, body } =
      Checkbox.splitCheckbox(line);

    return new Checkbox({
      indentation,
      listMarker,
      statusSymbol,
      body,
    });
  }

  static splitCheckbox(line: string): {
    indentation: string;
    listMarker: string;
    statusSymbol: string;
    body: string;
  } {
    const regexMatch = line.match(Checkbox.CHECKBOX_REGEX);

    if (regexMatch === null) {
      throw new Error("Line does not match task regex");
    }

    const { indentation, listMarker, statusSymbol, body } =
      regexMatch.groups ?? {};

    return { indentation, listMarker, statusSymbol, body };
  }
}
