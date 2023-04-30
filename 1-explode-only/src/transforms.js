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
