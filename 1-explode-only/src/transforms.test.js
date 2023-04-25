const SD = require("style-dictionary");
const { attributeCti, typeCubicBezier, typeFontFamily } = require("./transforms");

describe("dtcg/attribute/cti", () => {
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

describe("dtcg/type/css/cubicBezier", () => {
  test("transforms", () => {
    const token = { value: ["0.42", "0.0", "1.0", "1.0"] };
    expect(typeCubicBezier.transformer(token)).toBe("cubic-bezier(0.42, 0.0, 1.0, 1.0)");
  });
});

describe("dtcg/type/css/fontFamily", () => {
  test("transforms", () => {
    const token = { value: ["system-ui", "Comic Sans MS"] };
    expect(typeFontFamily.transformer(token)).toBe('system-ui, "Comic Sans MS"');
  });
});
