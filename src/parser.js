function isObject(item) {
  return typeof item === "object" && !Array.isArray(item) && item !== null;
}

function isGroup(token) {
  return !token.hasOwnProperty("value");
}

function isComposite(token) {
  return (
    ["border", "gradient", "typography", "shadow", "strokeStyle", "transition"].includes(token.$type) &&
    isObject(token.value)
  );
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
    // Note, $value is actually an array of the following
    // How to attach type to individual points?
    color: "color",
    position: "", // 0, decimal, 1 -- greater than 1 = 1, less than 0 = 0
  },
  shadow: {
    color: "color",
    offsetX: "dimension",
    offsetY: "dimension",
    blur: "dimension",
    spread: "dimension",
  },
  strokeStyle: {
    // $value = string stroke value
    // or $value = { dashArray: "dimension", lineCap: "" }
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
    letterSpacing: "dimension", // ? tricky tricky
    lineHeight: "",
  },
};

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
 *       @: {
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
 * Config:
 * - For composite tokens, all of those new tokens will be included in the final deliverables.
 *   To omit them, set `platform.<type>.files[{ filter: 'removePrivate' }, ...]`.
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

        // Create new tokens for each child value
        for (const [key, value] of Object.entries(token.value)) {
          childTokens[key] = {
            value,
            $type: w3cCompositeTokenSpec[token.$type][key],
            private: true,
          };

          childAliases[key] = `{${[...path, key].join(".")}}`;
        }

        // Create a new composite token, copying over all properties from the original
        // and setting its child values to aliases.
        // Note, the "@" key is a hack. SD doesn't include it in the final token name.
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
    // console.log("final tokens...", tokens.theme.border);
    return tokens;
  },
};
