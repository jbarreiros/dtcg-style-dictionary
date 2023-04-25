const SD = require("style-dictionary");
const { dtcgParser } = require("./src/parser");
const {
  attributeCti,
  typeCubicBezier,
  typeFontFamily,
  compositeBorder,
  compositeGradient,
  compositeShadow,
  compositeTransition,
  compositeTypography,
} = require("./src/transforms");

// Adjust the default transform groups
["css", "js", "scss"].forEach((name) => {
  // Replace "attribute/cti" with custom
  const attributeCtiTransformIndex = SD.transformGroup[name].findIndex((v) => v === "attribute/cti");
  SD.transformGroup[name].splice(attributeCtiTransformIndex, 1, "dtcg/attribute/cti");

  // Append custom transforms
  SD.transformGroup[name] = [
    ...SD.transformGroup[name],
    "dtcg/composite/css/border",
    "dtcg/composite/css/gradient",
    "dtcg/composite/css/shadow",
    "dtcg/composite/css/transition",
    "dtcg/composite/css/typography",
    "dtcg/type/css/cubicBezier",
    "dtcg/type/css/fontFamily",
  ];
});

module.exports = {
  source: [`${__dirname}/tokens/tokens.json`],
  parsers: [dtcgParser],
  transform: {
    [attributeCti.name]: attributeCti,
    [compositeBorder.name]: compositeBorder,
    [compositeGradient.name]: compositeGradient,
    [compositeShadow.name]: compositeShadow,
    [compositeTransition.name]: compositeTransition,
    [compositeTypography.name]: compositeTypography,
    [typeCubicBezier.name]: typeCubicBezier,
    [typeFontFamily.name]: typeFontFamily,
  },
  platforms: {
    css: {
      transformGroup: "css",
      buildPath: `${__dirname}/build/css/`,
      files: [
        {
          destination: "variables.css",
          format: "css/variables",
        },
      ],
    },
    scss: {
      transformGroup: "scss",
      buildPath: `${__dirname}/build/scss/`,
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
    js: {
      transformGroup: "js",
      buildPath: `${__dirname}/build/js/`,
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
      buildPath: `${__dirname}/build/json/`,
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
