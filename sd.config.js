const SD = require("style-dictionary");
const originalAttributeCtiTransform = SD.transform["attribute/cti"].transformer;

// Composite token transforms

SD.registerTransform({
  type: "value",
  transitive: true,
  name: "w3c/composite/border",
  matcher: (token) => token.$type === "border",
  transformer: ({ value }) => `${value.width} ${value.style} ${value.color}`,
});

// Overwrite "attribute/cti" to remap CTI attributes based on $type
SD.registerTransform({
  type: "attribute",
  name: "attribute/cti",
  transformer: (token) => {
    const attributes = originalAttributeCtiTransform(token);

    switch (token.$type) {
      case "color":
        attributes.category = "color";
        break;
      case "dimension":
        attributes.category = "size";
        // This is a bit of hack to determine whether or not the token
        // relates to a font dimension.
        if (token.path.includes("font")) {
          attributes.type = "font";
        }
        break;
      case "fontFamily":
        attributes.category = "font";
        break;
      case "duration":
        attributes.category = "time";
        break;
      default:
        break;
    }

    return attributes;
  },
});

// Parser to convert w3c tokens to Style Dictionary tokens
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

        token["@"] = {
          $type: token.$type,
          value: token.value,
        };

        delete token.value;
      }
    }

    walk(tokens);
    // console.log("final tokens...", tokens.theme);
    return tokens;
  },
});

// Append composite token transforms into predefined transform groups
["css", "js", "scss"].forEach((name) => {
  // Temp: wanted to test with size/pxToRem
  // Is it better to add custom/css, etc.?
  const sizeRemTransformIndex = SD.transformGroup[name].findIndex((v) => v === "size/rem");
  SD.transformGroup[name][sizeRemTransformIndex] = "size/pxToRem";

  SD.transformGroup[name] = [...SD.transformGroup[name], "w3c/composite/border"];
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
