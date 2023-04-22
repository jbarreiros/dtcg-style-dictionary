function isObject(val) {
  return typeof val === "object" && !Array.isArray(val) && val !== null;
}

function isGroup(token) {
  return !token.hasOwnProperty("value");
}

/**
 * For mapping w3c composite token value properties to a w3c value type.
 */
const w3cCompositeTokenSpec = {
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
    color: "color",
    offsetX: "dimension",
    offsetY: "dimension",
    blur: "dimension",
    spread: "dimension",
  },
  strokeStyle: {
    dashArray: "dimension",
    lineCap: undefined,
  },
  transition: {
    duration: "duration",
    delay: "duration",
    timingFunction: "cubicBezier",
  },
  typography: {
    fontFamily: "fontFamily",
    fontSize: "dimension",
    fontWeight: "fontWeight",
    letterSpacing: "dimension",
    lineHeight: undefined,
  },
};

function isComposite(token) {
  return (
    Object.keys(w3cCompositeTokenSpec).includes(token.$type) &&
    (typeof token.value === "object" || Array.isArray(token.value))
  );
}

function* getCompositeValues(value, step = undefined) {
  if (Array.isArray(value)) {
    for (const [i, val] of value.entries()) {
      yield* getCompositeValues(val, i + 1);
    }

    return;
  }

  for (const [key, val] of Object.entries(value)) {
    yield [key, val, step];
  }
}

/**
 * Migrates w3c-formatted design tokens into tokens that Style Dictionary can process.
 *
 * Rename property names:
 * - $value -> value
 * - $description -> comment
 *
 * Expand composite tokens into individual tokens, and update its child values
 * to use aliases:
 * {
 *   border: {
 *     thin: {
 *       $type: 'border',
 *       value: {
 *         width: "1px",
 *         color: "black"
 *       }
 *     }
 *   }
 * }
 * ⬆️ becomes ⬇️
 * {
 *   border: {
 *     thin: {
 *       width: { value: '1px', $type: 'dimension' },
 *       color: { value: 'black', $type: 'color' },
 *       COMPOSITE: {
 *         $type: 'border'
 *         value: {
 *           width: { value: '{border.thin.width}' },
 *           color: { value: '{border.thin.color}' }
 *         }
 *       }
 *     }
 *   }
 * }
 *
 * Note, when processing $value, there are some assumptions:
 * - $value is an object, e.g. `{a:1, b:1, ...}`
 * - $value is an array, e.g. `[{a:1, ...}, {a:2, ...}]`
 * - Within $value, there are no nesting objects or arrays.
 */
exports.w3cParser = {
  pattern: /\.json|\.tokens\.json|\.tokens$/,
  parse: ({ filePath, contents }) => {
    // Rename w3c property names to their equivalent Style Dictionary names
    const preparedContent = (contents || "{}")
      .replace(/"\$?value"\s*:/g, '"value":')
      .replace(/"\$?description"\s*:/g, '"comment":');

    // Convert JSON string to object
    const tokens = JSON.parse(preparedContent);

    // Track where we are in the tree.
    const path = [];

    // Recursive function to iterate over all tokens
    function walk(token, key) {
      if (!isObject(token)) {
        return;
      }

      if (isGroup(token)) {
        for (const [nextKey, nextToken] of Object.entries(token)) {
          path.push(nextKey);
          walk(nextToken, nextKey);
          path.pop();
        }

        return;
      }

      if (isComposite(token)) {
        const childTokens = {};
        const childAliases = {};

        // Create new tokens
        for (const [key, value, step] of getCompositeValues(token.value)) {
          const childTokenName = `${step ? `${step}-` : ""}${key}`;

          childTokens[childTokenName] = {
            value,
            $type: w3cCompositeTokenSpec[token.$type][key],
            intermediate: true,
          };

          // FIXME Should the shape of childAliases always match the token's
          // orginal value? Value arrays (like gradient) are collapsed into a
          // key/value pair object.
          childAliases[childTokenName] = `{${[...path, childTokenName].join(".")}}`;
        }

        // Create a new composite token, copying over all properties from the original
        // and setting its child values to aliases.
        childTokens["@"] = {
          ...token,
          value: childAliases,
        };

        // Remove all properties from the original token
        Object.keys(token).forEach((key) => delete token[key]);

        // Repopulate the original token
        Object.keys(childTokens).forEach((key) => (token[key] = { ...childTokens[key] }));
      }
    }

    walk(tokens);
    // console.log("final tokens...", tokens.composite.gradient["blue-to-red"]);
    return tokens;
  },
};
