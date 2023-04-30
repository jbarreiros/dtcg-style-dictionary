const { dtcgParser } = require("./parser");

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

    expect(dtcgParser.parse({ contents: raw })).toEqual(expected);
  });

  test("does not error if JSON is empty", () => {
    expect(dtcgParser.parse({ contents: "" })).toEqual({});
  });

  test("migrates a composite 'border' token", () => {
    const raw = JSON.stringify({
      border: {
        thin: {
          $type: "border",
          $description: "Default border",
          $value: {
            color: "rebeccapurple",
            style: "solid",
            width: "1px",
          },
        },
      },
    });

    const dictionary = dtcgParser.parse({ contents: raw });

    expect(dictionary.border.thin).toStrictEqual({
      $type: "border",
      comment: "Default border",
      color: {
        $type: "color",
        value: "rebeccapurple",
      },
      style: {
        $type: "strokeStyle",
        value: "solid",
      },
      width: {
        $type: "dimension",
        value: "1px",
      },
    });
  });

  test("migrates a composite 'gradient' token", () => {
    const raw = JSON.stringify({
      gradient: {
        "blue-to-red": {
          $type: "gradient",
          $description: "Red-to-green gradient",
          $value: [
            {
              color: "#0000ff",
              position: 0.6,
            },
            {
              color: "#ff0000",
              position: 1,
            },
          ],
        },
      },
    });

    const dictionary = dtcgParser.parse({ contents: raw });

    expect(dictionary.gradient["blue-to-red"]).toStrictEqual({
      $type: "gradient",
      comment: "Red-to-green gradient",
      "1-color": {
        $type: "color",
        value: "#0000ff",
      },
      "1-position": {
        $type: undefined,
        value: 0.6,
      },
      "2-color": {
        $type: "color",
        value: "#ff0000",
      },
      "2-position": {
        $type: undefined,
        value: 1,
      },
    });
  });

  test("migrates a composite 'shadow' token", () => {
    const raw = JSON.stringify({
      shadow: {
        card: {
          $type: "shadow",
          $description: "Shadow for cards",
          $value: {
            blur: "1.5",
            color: "#00000088",
            offsetX: "0.5",
            offsetY: "0.5",
            spread: "0",
          },
        },
      },
    });

    const dictionary = dtcgParser.parse({ contents: raw });

    expect(dictionary.shadow.card).toStrictEqual({
      $type: "shadow",
      comment: "Shadow for cards",
      blur: {
        $type: "dimension",
        value: "1.5",
      },
      color: {
        $type: "color",
        value: "#00000088",
      },
      offsetX: {
        $type: "dimension",
        value: "0.5",
      },
      offsetY: {
        $type: "dimension",
        value: "0.5",
      },
      spread: {
        $type: "dimension",
        value: "0",
      },
    });
  });

  test.todo("migrates a composite 'strokeStyle' token");

  test("migrates a composite 'transition' token", () => {
    const raw = JSON.stringify({
      transition: {
        emphasis: {
          $type: "transition",
          $description: "Emphatic transition",
          $value: {
            delay: "0ms",
            duration: "200ms",
            timingFunction: [0.5, 0, 1, 1],
          },
        },
      },
    });

    const dictionary = dtcgParser.parse({ contents: raw });

    expect(dictionary.transition.emphasis).toStrictEqual({
      $type: "transition",
      comment: "Emphatic transition",
      delay: {
        $type: "duration",
        value: "0ms",
      },
      duration: {
        $type: "duration",
        value: "200ms",
      },
      timingFunction: {
        $type: "cubicBezier",
        value: [0.5, 0, 1, 1],
      },
    });
  });

  test("migrates a composite typography token", () => {
    const raw = JSON.stringify({
      typography: {
        body: {
          $type: "typography",
          $description: "Body Default",
          $value: {
            fontFamily: "Roboto",
            fontSize: "16px",
            fontWeight: "normal",
            letterSpacing: "-1",
            lineHeight: "1.2",
          },
        },
      },
    });

    const dictionary = dtcgParser.parse({ contents: raw });

    expect(dictionary.typography.body).toStrictEqual({
      $type: "typography",
      comment: "Body Default",
      fontFamily: {
        $type: "fontFamily",
        value: "Roboto",
      },
      fontSize: {
        $type: "dimension",
        value: "16px",
      },
      fontWeight: {
        $type: "fontWeight",
        value: "normal",
      },
      letterSpacing: {
        $type: "dimension",
        value: "-1",
      },
      lineHeight: {
        $type: "number",
        value: "1.2",
      },
    });
  });
});
