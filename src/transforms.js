const chalk = require("chalk");

/**
 *
 */
exports.attributeCti = {
  type: "attribute",
  name: "w3c/attribute/cti",
  transformer: (token) => {
    const { attributes } = token;

    if (!attributes || !attributes.category) {
      console.error(
        chalk.red(
          'Token is missing CTI attributes. Transform "w3c/attribute/cti" expects "attribute/cti" to have been run.'
        )
      );

      return {};
    }

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
  matcher: (token) => token.$type === "border",
  transformer: ({ value }) => `${value.width} ${value.style} ${value.color}`,
};

exports.compositeShadow = {
  type: "value",
  transitive: true,
  name: "w3c/composite/css/shadow",
  matcher: (token) => token.$type === "shadow",
  transformer: ({ value }) => `${value.x || 0} ${value.y || 0} ${value.blur || 0} ${value.spread || 0} ${value.color}`,
};

exports.compositeTypography = {
  type: "value",
  transitive: true,
  name: "w3c/composite/css/typography",
  matcher: (token) => token.$type === "typography",
  transformer: ({ value }) =>
    [
      value?.fontStyle,
      value?.fontWeight,
      `${value.fontSize}${value?.lineHeight ? `/${value.lineHeight}` : ""}`,
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
 * - cubicBezier  ?? maybe, css = `cubic-bezier(#,#,#,#)`, other platforms??
 * - dimension
 * - duration
 * - fontWeight
 */

exports.typeFontFamily = {
  type: "value",
  transitive: true,
  name: "w3c/type/css/fontFamily",
  matcher: (token) => token.$type === "fontFamily" && Array.isArray(token.value),
  transformer: ({ value }) => {
    const families = value.map((family) => (/\s/g.test(family) ? `"${family}"` : family));
    return families.join(", ");
  },
};
