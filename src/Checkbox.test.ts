import { Checkbox } from "./Checkbox";
import { Status } from "./Status";

describe("Checkbox", () => {
  describe("fromLine", () => {
    const testCase1 = "  - [x] Example task";
    it(testCase1, () => {
      const checkbox = Checkbox.fromLine(testCase1);

      expect(checkbox.indentation).toBe("  ");
      expect(checkbox.listMarker).toBe("-");
      expect(checkbox.statusSymbol).toBe("x");
      expect(checkbox.status).toEqual(Status.Done());
      expect(checkbox.body).toBe("Example task");
    });
    const testCase2 = "This is not a valid task";
    it(testCase2, () => {
      expect(() => Checkbox.fromLine(testCase2)).toThrow(
        "Line does not match task regex"
      );
    });
  });
});
