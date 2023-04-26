// Mapping of composite token values to token types.
// Note, "undefined" means the spec does not define a type.
const compositeTokenTypeMap = {
  border: {
    color: "color",
    width: "dimension",
    style: "strokeStyle",
  },
  gradient: {
    color: "color",
    position: undefined,
  },
  shadow: {
    blur: "dimension",
    color: "color",
    offsetX: "dimension",
    offsetY: "dimension",
    spread: "dimension",
  },
  strokeStyle: {
    dashArray: "dimension",
    lineCap: undefined,
  },
  transition: {
    delay: "duration",
    duration: "duration",
    timingFunction: "cubicBezier",
  },
  typography: {
    fontFamily: "fontFamily",
    fontSize: "dimension",
    fontWeight: "fontWeight",
    letterSpacing: "dimension",
    lineHeight: "number",
  },
};

function isTokenGroup(token) {
  return !token.hasOwnProperty("value");
}

function isCompositeToken(token) {
  return Object.keys(compositeTokenTypeMap).includes(token.$type) && typeof token.value === "object";
}

/**
 * Iterate over a composite token's value.
 * For an object, yield each object property.
 * For an array of objects, step into each array item, and yield each object property.
 */
function* getCompositeValues(tokenValue, step = undefined) {
  if (Array.isArray(tokenValue)) {
    for (const [index, value] of tokenValue.entries()) {
      yield* getCompositeValues(value, index);
    }

    return;
  }

  for (const [key, value] of Object.entries(tokenValue)) {
    yield [key, value, step];
  }
}

/**
 * Migrates design tokens following the Design Tokens Community Group specification
 * into a format that Style Dictionary can process.
 *
 * Rename property names:
 * - $value -> value
 * - $description -> comment
 *
 * For each composite token, change it to a group token, and expand its $value
 * into new tokens:
 * {
 *   "border": {
 *     "thin": {
 *       "$type": "border",
 *       "$description": "Thin border",
 *       "value": {
 *         "width": "1px",
 *         "color": "black"
 *       }
 *     }
 *   }
 * }
 * ⬆️ becomes ⬇️
 * {
 *   "border": {
 *     "thin": {
 *       "width": { "value": "1px", "$type": "dimension" },
 *       "color": { "value": "black", "$type": "color" },
 *     }
 *   }
 * }
 *
 * Note, when processing $value, there are some assumptions:
 * - $value is an object, e.g. `{a:1, b:1, ...}`
 * - $value is an array, e.g. `[{a:1, ...}, {a:2, ...}]`
 * - Within $value, there are no nesting objects or arrays.
 */
exports.dtcgParser = {
  pattern: /\.json|\.tokens\.json|\.tokens$/,
  parse: ({ filePath, contents }) => {
    // Rename "$" property names to their equivalent Style Dictionary names
    const preparedContent = (contents || "{}")
      .replace(/"\$?value"\s*:/g, '"value":')
      .replace(/"\$?description"\s*:/g, '"comment":');

    // Convert JSON string to object
    const tokens = JSON.parse(preparedContent);

    // Recursive function to iterate over all tokens
    function walk(token, key) {
      if (isTokenGroup(token)) {
        for (const [nextKey, nextToken] of Object.entries(token)) {
          walk(nextToken, nextKey);
        }

        return;
      }

      if (!isCompositeToken(token)) {
        return;
      }

      // For every value object property, create a new token.
      const childTokens = {};

      for (const [key, value, step] of getCompositeValues(token.value)) {
        const childTokenName = `${Array.isArray(token.value) ? `${step + 1}-` : ""}${key}`;

        childTokens[childTokenName] = {
          value,
          $type: compositeTokenTypeMap[token.$type][key],
        };
      }

      // Remove "value". The composite token is now a group token.
      delete token.value;

      // Attach new tokens to the group.
      Object.keys(childTokens).forEach((key) => (token[key] = { ...childTokens[key] }));
    }

    walk(tokens);

    return tokens;
  },
};
