exports.cssUtilityClass = {
  name: "css/utility-class",
  formatter: ({ dictionary, file, options }) => {
    console.log(dictionary.tokens.composite.border.thin["@"]);

    // const classses = [];

    // const token = dictionary.tokens.composite.border.thin['@']
    // const path = token.path

    // const border = [`.${token.name} {`, `border-width: ${dictionary.}`];

    return "";
  },
};
