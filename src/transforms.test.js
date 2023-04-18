const SD = require("style-dictionary");
const { attributeCti, compositeBorder } = require("./transforms");

describe("w3c/attribute/cti", () => {
  it.each([
    ["color", "color"],
    ["dimension", "size"],
    ["duration", "time"],
    ["fontFamily", "font"],
  ])("sets attributes.category to '%s'", ($type, expected) => {
    const token = {
      $type,
      path: [], // necessary for test to run, but can be empty
    };

    expect(attributeCti.transformer(token)).toEqual({
      category: expected,
    });
  });

  it("sets attributes.type to 'font' when token is probably a font size", () => {
    const token = {
      $type: "dimension",
      path: ["font", "size", "base"],
    };

    expect(attributeCti.transformer(token)).toEqual({
      category: "size",
      type: "font",
    });
  });

  it("should leave other attributes alone", () => {
    const token = {
      $type: "color",
      path: [],
      attributes: { extra: "extra" },
    };

    expect(attributeCti.transformer(token)).toEqual({ category: "color", extra: "extra" });
  });
});

describe("w3c/composite/css/border", () => {
  test("matcher()", () => {
    expect(compositeBorder.matcher({ $type: "border" })).toBe(true);
    expect(compositeBorder.matcher({ $type: "color" })).toBe(false);
  });

  test.each([
    [{ style: "solid" }, "solid"],
    [{ width: "1px", style: "solid" }, "1px solid"],
    [{ style: "solid", color: "green" }, "solid green"],
    [{ width: "1px", style: "solid", color: "green" }, "1px solid green"],
  ])("transformer(%j)", (value, expected) => {
    const token = { value };
    expect(compositeBorder.transformer(token)).toBe(expected);
  });
});

describe("w3c/composite/css/shadow", () => {});

describe("w3c/composite/css/typography", () => {});

describe("w3c/type/css/cubicBezier", () => {});

describe("w3c/type/css/fontFamily", () => {});
