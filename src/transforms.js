const chalk = require("chalk");

/**
 * Adds: category, and type on the attributes object based on the token's $type.
 */
exports.attributeCti = {
  type: "attribute",
  name: "w3c/attribute/cti",
  transformer: (token) => {
    const { attributes = {} } = token;

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
      case "duration":
        attributes.category = "time";
        break;
      case "fontFamily":
        attributes.category = "font";
        break;
      case "fontWeight":
      case "cubicBezier":
      default:
        // Nothing to remap
        break;
    }

    return attributes;
  },
};

/**
 * The following tranforms are for converting composite tokens into a single value.
 *
 * TODO:
 * - strokeStyle
 *  - challenge: $value is a string or object
 *
 * FIXME:
 * - typography has an extra letterSpacing property...
 *  - available as its own token, but...
 *  - how does it work when using an alias to a typography token?
 */

// value: { color, width, style }
exports.compositeBorder = {
  type: "value",
  transitive: true,
  name: "w3c/composite/css/border",
  matcher: ({ $type, value }) => $type === "border" && typeof value === "object",
  transformer: ({ value }) => [value.width, value.style, value.color].filter(Boolean).join(" "),
};

// value: { color1, position1, color2, ... } (position = [0,1])
// Note, this function expects the custom parser to have converted the array of
// values into a flat key/value pair object.
// This function also assumes that the steps are ordered (does not sort by position).
exports.compositeGradient = {
  type: "value",
  transitive: true,
  name: "w3c/composite/css/gradient",
  matcher: ({ $type, value }) => $type === "gradient" && typeof value === "object",
  transformer: ({ value }) => {
    return Object.entries(value)
      .map(([key, val]) => (key.endsWith("color") ? val : undefined))
      .filter(Boolean)
      .join(", ");
  },
};

// value: { color, offsetX, offsetY, blur, spread }
exports.compositeShadow = {
  type: "value",
  transitive: true,
  name: "w3c/composite/css/shadow",
  matcher: ({ $type, value }) => $type === "shadow" && typeof value === "object",
  transformer: ({ value }) =>
    [value.offsetX, value.offsetY, value.blur, value.spread, value.color].filter(Boolean).join(" "),
};

exports.compositeStrokeStyle = {
  //TODO
};

// value: { duration, timingFunction, delay }
// css -> `transition: <property> <duration> <timing-function> <delay>;`
exports.compositeTransition = {
  type: "value",
  transitive: true,
  name: "w3c/composite/css/transition",
  matcher: ({ $type, value }) => $type === "transition" && typeof value === "object",
  transformer: ({ value }) => [value.duration, value.timingFunction, value.delay].filter(Boolean).join(" "),
};

// value: { fontFamily, fontSize, fontWeight, letterSpacing, lineHeight }
exports.compositeTypography = {
  type: "value",
  transitive: true,
  name: "w3c/composite/css/typography",
  matcher: ({ $type, value }) => $type === "typography" && typeof value === "object",
  transformer: ({ value }) =>
    [value.fontWeight, `${value.fontSize}${value.lineHeight ? `/${value.lineHeight}` : ""}`, value.fontFamily]
      .filter(Boolean)
      .join(" "),
};

/**
 * The following transforms are for handling token $type values.
 *
 * The following types do not need special handling:
 * - color
 * - dimension
 * - duration
 * - fontWeight
 */

// value: [P1x, P1y, P2x, P2y] (x = [0,1], y = [-∞,∞])
exports.typeCubicBezier = {
  type: "value",
  transitive: true,
  name: "w3c/type/css/cubicBezier",
  matcher: ({ $type, value }) => $type === "cubicBezier" && Array.isArray(value),
  transformer: ({ value }) => `cubic-bezier(${value.join(", ")})`,
};

// value: [family1, family2, ...]
exports.typeFontFamily = {
  type: "value",
  transitive: true,
  name: "w3c/type/css/fontFamily",
  matcher: ({ $type, value }) => $type === "fontFamily" && Array.isArray(value),
  transformer: ({ value }) => {
    const families = value.map((family) => (/\s/g.test(family) ? `"${family}"` : family));
    return families.join(", ");
  },
};
