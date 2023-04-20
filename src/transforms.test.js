const SD = require("style-dictionary");
const {
  attributeCti,
  compositeBorder,
  compositeShadow,
  compositeTypography,
  typeCubicBezier,
  typeFontFamily,
} = require("./transforms");

describe("w3c/attribute/cti", () => {
  test.each([
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

  test("sets attributes.type to 'font' when token is probably a font size", () => {
    const token = {
      $type: "dimension",
      path: ["font", "size", "base"],
    };

    expect(attributeCti.transformer(token)).toEqual({
      category: "size",
      type: "font",
    });
  });

  test("should leave other attributes alone", () => {
    const token = {
      $type: "color",
      path: [],
      attributes: { extra: "extra" },
    };

    expect(attributeCti.transformer(token)).toEqual({ category: "color", extra: "extra" });
  });
});

describe("w3c/composite/css/border", () => {
  test.each([
    [{ style: "solid" }, "solid"],
    [{ width: "1px", style: "solid" }, "1px solid"],
    [{ style: "solid", color: "green" }, "solid green"],
    [{ width: "1px", style: "solid", color: "green" }, "1px solid green"],
  ])("transforms %j", (value, expected) => {
    const token = { value };
    expect(compositeBorder.transformer(token)).toBe(expected);
  });
});

describe("w3c/composite/css/shadow", () => {
  test.each([
    [{ x: "60px", y: "-16px", color: "teal" }, "60px -16px teal"],
    [{ x: "10px", y: "5px", blur: "5px", color: "black" }, "10px 5px 5px black"],
    [
      { x: "2px", y: "2px", blur: "2px", spread: "1px", color: "rgba(0, 0, 0, 0.2)" },
      "2px 2px 2px 1px rgba(0, 0, 0, 0.2)",
    ],
  ])("transforms %j", (value, expected) => {
    const token = { value };
    expect(compositeShadow.transformer(token)).toBe(expected);
  });
});

describe("w3c/composite/css/typography", () => {
  test.each([
    [{ fontSize: "12px", fontFamily: "system-ui, Roboto" }, "12px system-ui, Roboto"],
    [{ fontWeight: "bold", fontSize: "12px", fontFamily: "system-ui, Roboto" }, "bold 12px system-ui, Roboto"],
    [
      { fontWeight: "bold", fontSize: "12px", lineHeight: "1.2", fontFamily: "system-ui, Roboto" },
      "bold 12px/1.2 system-ui, Roboto",
    ],
  ])("transforms %j", (value, expected) => {
    const token = { value };
    expect(compositeTypography.transformer(token)).toBe(expected);
  });
});

describe("w3c/type/css/cubicBezier", () => {
  test("transforms", () => {
    const token = { value: ["0.42", "0.0", "1.0", "1.0"] };
    expect(typeCubicBezier.transformer(token)).toBe("cubic-bezier(0.42, 0.0, 1.0, 1.0)");
  });
});

describe("w3c/type/css/fontFamily", () => {
  test("transforms", () => {
    const token = { value: ["system-ui", "Comic Sans MS"] };
    expect(typeFontFamily.transformer(token)).toBe('system-ui, "Comic Sans MS"');
  });
});
