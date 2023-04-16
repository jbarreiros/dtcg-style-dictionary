const SD = require("style-dictionary");
// const StyleDictionary = require("style-dictionary-utils");

SD.registerTransform({
  type: "value",
  transitive: true,
  name: "w3c/composite/border",
  matcher: (token) => token.type === "border",
  transformer: ({ value }) => `${value.width} ${value.style} ${value.color}`,
});

SD.registerParser({
  pattern: /\.json$/,
  parse: ({ filePath, contents }) => {
    // Rename "$value" and "$description" to "value" and "comment"
    const preparedContent = (contents || "{}")
      .replace(/"\$?value"\s*:/g, '"value":')
      .replace(/"\$?description"\s*:/g, '"comment":');

    // Convert to JSON
    const tokens = JSON.parse(preparedContent);

    function isObject(item) {
      return typeof item === "object" && !Array.isArray(item) && item !== null;
    }

    function isComposite(type) {
      return ["typography", "shadow"].includes(type);
    }

    // Iterate over tokens, looking for composite tokens.
    // Composite token parts are inserted as their own tokens.
    function walk(token) {
      if (!isObject(token)) {
        return;
      }

      if (!token.hasOwnProperty("value")) {
        for (const nextToken of Object.values(token)) {
          walk(nextToken);
        }

        return;
      }

      if (isComposite(token.$type)) {
        for (const [key, value] of Object.entries(token.value)) {
          token[key] = {
            value,
            $type: key,
          };
        }

        token[" "] = {
          $type: token.$type,
          value: token.value,
        };
        // token.composite = token.value;
        delete token.value;
      }
    }

    walk(tokens);
    console.log("final tokens...", tokens.theme);
    return tokens;
  },
});

module.exports = {
  source: ["tokens.json"],
  platforms: {
    scss: {
      transformGroup: "scss",
      buildPath: "build/scss/",
      files: [
        {
          destination: "_variables.scss",
          format: "scss/variables",
        },
        {
          destination: "_map-flat.scss",
          format: "scss/map-flat",
        },
        {
          destination: "_map-deep.scss",
          format: "scss/map-deep",
        },
      ],
    },
    css: {
      transformGroup: "css",
      buildPath: "build/css/",
      files: [
        {
          destination: "variables.css",
          format: "css/variables",
        },
      ],
    },
    js: {
      transformGroup: "js",
      buildPath: "build/js/",
      files: [
        {
          destination: "module.js",
          format: "javascript/module",
        },
        {
          destination: "module-flat.js",
          format: "javascript/module-flat",
        },
        {
          destination: "object.js",
          format: "javascript/object",
        },
      ],
    },
    // TODO ts
    json: {
      transformGroup: "js",
      buildPath: "build/json/",
      files: [
        {
          destination: "variables.json",
          format: "json",
        },
        {
          destination: "nested.json",
          format: "json/nested",
        },
        {
          destination: "flat.json",
          format: "json/flat",
        },
      ],
    },
  },
};
