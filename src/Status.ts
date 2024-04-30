export const StatusType = {
  TODO: "TODO",
  DOING: "DOING",
  DONE: "DONE",
  CANCELLED: "CANCELLED",
} as const;

export const StatusSymbol = {
  [StatusType.TODO]: " ",
  [StatusType.DOING]: "*",
  [StatusType.DONE]: "x",
  [StatusType.CANCELLED]: "-",
} as const;

export type StatusType = (typeof StatusType)[keyof typeof StatusType];

export class Status {
  public readonly symbol: string;
  public readonly name: string;
  public readonly type: StatusType;
  public readonly nextStatusType: StatusType;

  constructor(
    symbol: string,
    name: string,
    type: StatusType,
    nextStatusType: StatusType
  ) {
    this.symbol = symbol;
    this.name = name;
    this.type = type;
    this.nextStatusType = nextStatusType;
  }

  static fromType(type: StatusType): Status {
    switch (type) {
      case StatusType.TODO:
        return Status.makeTodo();
      case StatusType.DOING:
        return Status.makeDoing();
      case StatusType.DONE:
        return Status.makeDone();
      case StatusType.CANCELLED:
        return Status.makeCancelled();
      default:
        throw new Error(`Unknown status type: ${type}`);
    }
  }

  static fromSymbol(symbol: string): Status {
    switch (symbol) {
      case StatusSymbol.TODO:
        return Status.makeTodo();
      case StatusSymbol.DOING:
        return Status.makeDoing();
      case StatusSymbol.DONE:
        return Status.makeDone();
      case StatusSymbol.CANCELLED:
        return Status.makeCancelled();
      default:
        throw new Error(`Unknown status symbol: ${symbol}`);
    }
  }

  static makeTodo(): Status {
    return new Status(
      StatusSymbol.TODO,
      "Todo",
      StatusType.TODO,
      StatusType.DOING
    );
  }

  static makeDoing(): Status {
    return new Status(
      StatusSymbol.DOING,
      "Doing",
      StatusType.DOING,
      StatusType.DONE
    );
  }

  static makeDone(): Status {
    return new Status(
      StatusSymbol.DONE,
      "Done",
      StatusType.DONE,
      StatusType.TODO
    );
  }

  static makeCancelled(): Status {
    return new Status(
      StatusSymbol.CANCELLED,
      "Cancelled",
      StatusType.CANCELLED,
      StatusType.TODO
    );
  }
}
