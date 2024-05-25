export const StatusType = {
  TODO: "TODO",
  DOING: "DOING",
  DONE: "DONE",
  CANCELLED: "CANCELLED",
} as const;

export const StatusSymbol = {
  [StatusType.TODO]: " ",
  [StatusType.DOING]: "/",
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
        return Status.Todo();
      case StatusType.DOING:
        return Status.Doing();
      case StatusType.DONE:
        return Status.Done();
      case StatusType.CANCELLED:
        return Status.Cancelled();
      default:
        throw new Error(`Unknown status type: ${type}`);
    }
  }

  static fromSymbol(symbol: string): Status {
    switch (symbol) {
      case StatusSymbol.TODO:
        return Status.Todo();
      case StatusSymbol.DOING:
        return Status.Doing();
      case StatusSymbol.DONE:
        return Status.Done();
      case StatusSymbol.CANCELLED:
        return Status.Cancelled();
      default:
        throw new Error(`Unknown status symbol: ${symbol}`);
    }
  }

  public nextStatus(): Status {
    return Status.fromType(this.nextStatusType);
  }

  static Todo(): Status {
    return new Status(
      StatusSymbol.TODO,
      "Todo",
      StatusType.TODO,
      StatusType.DOING
    );
  }

  static Doing(): Status {
    return new Status(
      StatusSymbol.DOING,
      "Doing",
      StatusType.DOING,
      StatusType.DONE
    );
  }

  static Done(): Status {
    return new Status(
      StatusSymbol.DONE,
      "Done",
      StatusType.DONE,
      StatusType.DONE
    );
  }

  static Cancelled(): Status {
    return new Status(
      StatusSymbol.CANCELLED,
      "Cancelled",
      StatusType.CANCELLED,
      StatusType.TODO
    );
  }

  static isTodo(status: Status): boolean {
    return status.type === StatusType.TODO;
  }

  static isDoing(status: Status): boolean {
    return status.type === StatusType.DOING;
  }

  static isDone(status: Status): boolean {
    return status.type === StatusType.DONE;
  }
}
