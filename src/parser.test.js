const { w3cParser } = require("./parser");

describe("parser", () => {
  test("renames properties $value, $description", () => {
    const raw = JSON.stringify({
      border: {
        base: { $value: "", $description: "" },
      },
    });

    const expected = {
      border: {
        base: { value: "", comment: "" },
      },
    };

    expect(w3cParser.parse({ filePath: "", contents: raw })).toEqual(expected);
  });

  test.todo("converts composite token into a group token"); // doesn't have a "value"
  test.todo("expands composite token into individual tokens"); // so SD can transform them
  test.todo("creates new composite token"); // $value properties replaced with aliases / has all original properties
  test.todo("handles no tokens without error");
});
