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

    expect(dtcgParser.parse({ filePath: "", contents: raw })).toEqual(expected);
  });

  test("does not error if JSON is empty", () => {
    expect(dtcgParser.parse({ filePath: "", contents: "" })).toEqual({});
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
          extra: "extra",
        },
      },
    });

    const dictionary = dtcgParser.parse({ filePath: "", contents: raw });

    expect(dictionary.border.thin).toStrictEqual({
      color: {
        $type: "color",
        value: "rebeccapurple",
        intermediate: true,
      },
      style: {
        $type: "strokeStyle",
        value: "solid",
        intermediate: true,
      },
      width: {
        $type: "dimension",
        value: "1px",
        intermediate: true,
      },
      "@": {
        $type: "border",
        comment: "Default border",
        value: {
          width: "{border.thin.width}",
          style: "{border.thin.style}",
          color: "{border.thin.color}",
        },
        extra: "extra",
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
          extra: "extra",
        },
      },
    });

    const dictionary = dtcgParser.parse({ filePath: "", contents: raw });

    expect(dictionary.gradient["blue-to-red"]).toStrictEqual({
      "1-color": {
        $type: "color",
        value: "#0000ff",
        intermediate: true,
      },
      "1-position": {
        $type: undefined,
        value: 0.6,
        intermediate: true,
      },
      "2-color": {
        $type: "color",
        value: "#ff0000",
        intermediate: true,
      },
      "2-position": {
        $type: undefined,
        value: 1,
        intermediate: true,
      },
      "@": {
        $type: "gradient",
        comment: "Red-to-green gradient",
        value: [
          {
            color: "{gradient.blue-to-red.1-color}",
            position: "{gradient.blue-to-red.1-position}",
          },
          {
            color: "{gradient.blue-to-red.2-color}",
            position: "{gradient.blue-to-red.2-position}",
          },
        ],
        extra: "extra",
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
          extra: "extra",
        },
      },
    });

    const dictionary = dtcgParser.parse({ filePath: "", contents: raw });

    expect(dictionary.shadow.card).toStrictEqual({
      blur: {
        $type: "dimension",
        value: "1.5",
        intermediate: true,
      },
      color: {
        $type: "color",
        value: "#00000088",
        intermediate: true,
      },
      offsetX: {
        $type: "dimension",
        value: "0.5",
        intermediate: true,
      },
      offsetY: {
        $type: "dimension",
        value: "0.5",
        intermediate: true,
      },
      spread: {
        $type: "dimension",
        value: "0",
        intermediate: true,
      },
      "@": {
        $type: "shadow",
        comment: "Shadow for cards",
        value: {
          offsetX: "{shadow.card.offsetX}",
          offsetY: "{shadow.card.offsetY}",
          blur: "{shadow.card.blur}",
          spread: "{shadow.card.spread}",
          color: "{shadow.card.color}",
        },
        extra: "extra",
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
          extra: "extra",
        },
      },
    });

    const dictionary = dtcgParser.parse({ filePath: "", contents: raw });

    expect(dictionary.transition.emphasis).toStrictEqual({
      delay: {
        $type: "duration",
        value: "0ms",
        intermediate: true,
      },
      duration: {
        $type: "duration",
        value: "200ms",
        intermediate: true,
      },
      timingFunction: {
        $type: "cubicBezier",
        value: [0.5, 0, 1, 1],
        intermediate: true,
      },
      "@": {
        $type: "transition",
        comment: "Emphatic transition",
        value: {
          delay: "{transition.emphasis.delay}",
          duration: "{transition.emphasis.duration}",
          timingFunction: "{transition.emphasis.timingFunction}",
        },
        extra: "extra",
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
          extra: "extra",
        },
      },
    });

    const dictionary = dtcgParser.parse({ filePath: "", contents: raw });

    expect(dictionary.typography.body).toStrictEqual({
      fontFamily: {
        $type: "fontFamily",
        value: "Roboto",
        intermediate: true,
      },
      fontSize: {
        $type: "dimension",
        value: "16px",
        intermediate: true,
      },
      fontWeight: {
        $type: "fontWeight",
        value: "normal",
        intermediate: true,
      },
      letterSpacing: {
        $type: "dimension",
        value: "-1",
        intermediate: true,
      },
      lineHeight: {
        $type: "number",
        value: "1.2",
        intermediate: true,
      },
      "@": {
        $type: "typography",
        comment: "Body Default",
        value: {
          fontFamily: "{typography.body.fontFamily}",
          fontSize: "{typography.body.fontSize}",
          fontWeight: "{typography.body.fontWeight}",
          letterSpacing: "{typography.body.letterSpacing}",
          lineHeight: "{typography.body.lineHeight}",
        },
        extra: "extra",
      },
    });
  });
});
