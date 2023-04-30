/**
 * Adds: category, and type on the attributes object based on the token's $type.
 */
exports.attributeCti = {
  type: "attribute",
  name: "dtcg/attribute/cti",
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
      case "cubicBezier":
      case "fontWeight":
      case "number":
      default:
        // Nothing to remap
        break;
    }

    return attributes;
  },
};

/**
 * The following tranforms are for converting composite tokens into a single value.
 */

// value: { color, width, style }
// css -> border: <width> <style> <color>;
exports.compositeBorder = {
  type: "value",
  transitive: true,
  name: "dtcg/composite/css/border",
  matcher: ({ $type, value }) => $type === "border" && typeof value === "object",
  transformer: ({ value }) => [value.width, value.style, value.color].filter(Boolean).join(" "),
};

// value: [ { color, position }, ... ]
// css -> `background: linear-gradient(<direction>, <color1> <position1>, ...);
exports.compositeGradient = {
  type: "value",
  transitive: true,
  name: "dtcg/composite/css/gradient",
  matcher: ({ $type, value }) => $type === "gradient" && Array.isArray(value),
  transformer: ({ value }) => value.map(({ color, position }) => `${color} ${(position * 100).toFixed(0)}%`).join(", "),
};

// value: { color, offsetX, offsetY, blur, spread }
// css -> box-shadow: <offset-x> <offset-y> <blur-radius> <spread-radius> <color>;
exports.compositeShadow = {
  type: "value",
  transitive: true,
  name: "dtcg/composite/css/shadow",
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
  name: "dtcg/composite/css/transition",
  matcher: ({ $type, value }) => $type === "transition" && typeof value === "object",
  transformer: ({ value }) => [value.duration, value.timingFunction, value.delay].filter(Boolean).join(" "),
};

// value: { fontFamily, fontSize, fontWeight, letterSpacing, lineHeight }
// css -> font: <weight> <size>/<line-height> <family>;
exports.compositeTypography = {
  type: "value",
  transitive: true,
  name: "dtcg/composite/css/typography",
  matcher: ({ $type, value }) => $type === "typography" && typeof value === "object",
  transformer: ({ value }) =>
    [value.fontWeight, `${value.fontSize}${value.lineHeight ? `/${value.lineHeight}` : ""}`, value.fontFamily]
      .filter(Boolean)
      .join(" "),
};

/**
 * The following transforms are for handling token $type values.
 *
 * The following types do not need special handling because "dtcg/attribute/cti"
 * has mapped them to Style Dictionary aware types:
 *
 * DTCG Type  | SD type
 * --------------------
 * color      | color
 * dimension  | size
 * duration   | time
 * fontWeight | --
 * number     | --
 */

// value: [P1x, P1y, P2x, P2y] (x = [0,1], y = [-∞,∞])
exports.typeCubicBezier = {
  type: "value",
  transitive: true,
  name: "dtcg/type/css/cubicBezier",
  matcher: ({ $type, value }) => $type === "cubicBezier" && Array.isArray(value),
  transformer: ({ value }) => `cubic-bezier(${value.join(", ")})`,
};

// value: [family1, family2, ...]
exports.typeFontFamily = {
  type: "value",
  transitive: true,
  name: "dtcg/type/css/fontFamily",
  matcher: ({ $type, value }) => $type === "fontFamily" && Array.isArray(value),
  transformer: ({ value }) => {
    const families = value.map((family) => (/\s/g.test(family) ? `"${family}"` : family));
    return families.join(", ");
  },
};
