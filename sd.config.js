const SD = require("style-dictionary");
const {
  attributeCti,
  compositeBorder,
  compositeGradient,
  compositeShadow,
  compositeTypography,
  typeFontFamily,
  typeCubicBezier,
  compositeTransition,
} = require("./src/transforms");
const { w3cParser } = require("./src/parser");

SD.registerTransform(attributeCti);
SD.registerTransform(compositeBorder);
SD.registerTransform(compositeGradient);
SD.registerTransform(compositeShadow);
SD.registerTransform(compositeTransition);
SD.registerTransform(compositeTypography);
SD.registerTransform(typeCubicBezier);
SD.registerTransform(typeFontFamily);
SD.registerParser(w3cParser);

// Append composite token transforms into predefined transform groups
["css", "js", "scss"].forEach((name) => {
  // Replace 'attribute/cti' with custom
  const attributeCtiTransformIndex = SD.transformGroup[name].findIndex((v) => v === "attribute/cti");
  SD.transformGroup[name].splice(attributeCtiTransformIndex, 1, "w3c/attribute/cti");

  // Temp: wanted to test with size/pxToRem
  // Is it better to add custom/css, etc.?
  const sizeRemTransformIndex = SD.transformGroup[name].findIndex((v) => v === "size/rem");
  SD.transformGroup[name][sizeRemTransformIndex] = "size/pxToRem";

  SD.transformGroup[name] = [
    ...SD.transformGroup[name],
    "w3c/composite/css/border",
    "w3c/composite/css/gradient",
    "w3c/composite/css/shadow",
    "w3c/composite/css/transition",
    "w3c/composite/css/typography",
    "w3c/type/css/cubicBezier",
    "w3c/type/css/fontFamily",
  ];

  // console.log(SD.transformGroup[name]);
});

module.exports = {
  source: ["tokens/tokens.json"],
  platforms: {
    css: {
      transformGroup: "css",
      buildPath: "build/css/",
      files: [
        {
          destination: "variables.css",
          format: "css/variables",
        },
      ],
    },
    scss: {
      transformGroup: "scss",
      buildPath: "build/scss/",
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
      buildPath: "build/js/",
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
      buildPath: "build/json/",
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
