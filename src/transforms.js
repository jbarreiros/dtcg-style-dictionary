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
 * - gradient
 * - strokeStyle
 * - transition
 */

exports.compositeBorder = {
  type: "value",
  transitive: true,
  name: "w3c/composite/css/border",
  matcher: ({ $type }) => $type === "border",
  transformer: ({ value }) => [value.width, value.style, value.color].filter(Boolean).join(" "),
};

exports.compositeShadow = {
  type: "value",
  transitive: true,
  name: "w3c/composite/css/shadow",
  matcher: ({ $type }) => $type === "shadow",
  transformer: ({ value }) => [value.x, value.y, value.blur, value.spread, value.color].filter(Boolean).join(" "),
};

exports.compositeTypography = {
  type: "value",
  transitive: true,
  name: "w3c/composite/css/typography",
  matcher: ({ $type }) => $type === "typography",
  transformer: ({ value }) =>
    [
      value.fontStyle,
      value.fontWeight,
      `${value.fontSize}${value.lineHeight ? `/${value.lineHeight}` : ""}`,
      value.fontFamily,
    ]
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
