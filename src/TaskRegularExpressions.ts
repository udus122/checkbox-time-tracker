// ref. https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/src/Task/TaskRegularExpressions.ts
export class TaskRegularExpressions {
  // Matches indentation before a list marker (including > for potentially nested blockquotes or Obsidian callouts)
  public static readonly indentationRegex = /^([\s\t>]*)/;

  // Matches - * and + list markers, or numbered list markers (eg 1.)
  public static readonly listMarkerRegex = /([-*+]|[0-9]+\.)/;

  // Matches a checkbox and saves the status character inside
  public static readonly checkboxRegex = /\[(.)\]/u;

  // Matches the rest of the task after the checkbox.
  public static readonly afterCheckboxRegex = / *(.*)/u;

  // Main regex for parsing a line. It matches the following:
  // - Indentation
  // - List marker
  // - Status character
  // - Rest of task after checkbox markdown
  // See Task.extractTaskComponents() for abstraction around this regular expression.
  // That is private for now, but could be made public in future if needed.
  public static readonly taskRegex = new RegExp(
      TaskRegularExpressions.indentationRegex.source +
          TaskRegularExpressions.listMarkerRegex.source +
          ' +' +
          TaskRegularExpressions.checkboxRegex.source +
          TaskRegularExpressions.afterCheckboxRegex.source,
      'u',
  );
}
