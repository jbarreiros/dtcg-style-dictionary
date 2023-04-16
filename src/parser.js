function isObject(item) {
  return typeof item === "object" && !Array.isArray(item) && item !== null;
}

function isComposite(type) {
  return ["border", "gradient", "typography", "shadow", "strokeStyle", "transition"].includes(type);
}

/**
 * For mapping w3c token value properties to a w3c value type.
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
    timingFunction: "cubicBezier", // [P1x, P1y, P2x, P2y] (plain numbers, not dimensions)
  },
  typography: {
    fontFamily: "fontFamily",
    fontSize: "dimension",
    fontWeight: "fontWeight",
    letterSpacing: "dimension",
    lineHeight: "",
  },
};

exports.w3cParser = {
  pattern: /\.json|\.tokens\.json|\.tokens$/,
  parse: ({ filePath, contents }) => {
    // Rename "$value" and "$description" to "value" and "comment"
    const preparedContent = (contents || "{}")
      .replace(/"\$?value"\s*:/g, '"value":')
      .replace(/"\$?description"\s*:/g, '"comment":');

    // Convert to JSON
    const tokens = JSON.parse(preparedContent);

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

      // TODO should this be a setting?
      // Should composite tokens be exploded?
      // I think yes, so that transforms are applied to individual bits.
      // Or, should composite tokens always be references (i.e. no transforms)?
      if (isComposite(token.$type)) {
        const expandedToken = {};

        for (const [key, value] of Object.entries(token.value)) {
          expandedToken[key] = {
            value,
            $type: w3cCompositeTokenSpec?.[token.$type]?.[key],
            // In platform.<type>.files[], set `filter: 'removePrivate` to omit expanded tokens
            private: true,
          };
        }

        // The "@" is a hack. SD doesn't include it in the final token name.
        // It's a way to get a token name that is the same as its parent.
        expandedToken["@"] = { ...token };

        // This is probably really dangerous.
        // Make the current token a parent (i.e. has no value), fully replacing
        // its contents with the new expanded tokens. Any extra properties in
        // the this new parent might show up in the final generated files.
        Object.keys(token).forEach((key) => delete token[key]);
        Object.keys(expandedToken).forEach((key) => (token[key] = { ...expandedToken[key] }));
      }
    }

    walk(tokens);
    console.log("final tokens...", tokens.theme.border);
    return tokens;
  },
};
