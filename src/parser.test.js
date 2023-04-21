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

  test("does not error if JSON is empty", () => {
    expect(w3cParser.parse({ filePath: "", contents: "" })).toEqual({});
  });

  test("migrates a composite 'border' token", () => {
    const raw = JSON.stringify({
      border: {
        thin: {
          $type: "border",
          $description: "Default border",
          $value: {
            width: "1px",
            style: "solid",
            color: "rebeccapurple",
          },
          extra: "extra",
        },
      },
    });

    const dictionary = w3cParser.parse({ filePath: "", contents: raw });

    expect(dictionary.border.thin).toStrictEqual({
      width: {
        $type: "dimension",
        value: "1px",
        private: true,
      },
      style: {
        $type: "strokeStyle",
        value: "solid",
        private: true,
      },
      color: {
        $type: "color",
        value: "rebeccapurple",
        private: true,
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

  test.todo("migrates a composite 'gradient' token");

  test("migrates a composite 'shadow' token", () => {
    const raw = JSON.stringify({
      shadow: {
        card: {
          $type: "shadow",
          $description: "Shadow for cards",
          $value: {
            offsetX: "0.5",
            offsetY: "0.5",
            blur: "1.5",
            spread: "0",
            color: "#00000088",
          },
          extra: "extra",
        },
      },
    });

    const dictionary = w3cParser.parse({ filePath: "", contents: raw });

    expect(dictionary.shadow.card).toStrictEqual({
      offsetX: {
        $type: "dimension",
        value: "0.5",
        private: true,
      },
      offsetY: {
        $type: "dimension",
        value: "0.5",
        private: true,
      },
      blur: {
        $type: "dimension",
        value: "1.5",
        private: true,
      },
      spread: {
        $type: "dimension",
        value: "0",
        private: true,
      },
      color: {
        $type: "color",
        value: "#00000088",
        private: true,
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

  test.todo("migrates a composite 'transition' token");

  test.todo("migrates a composite typography token");
});
