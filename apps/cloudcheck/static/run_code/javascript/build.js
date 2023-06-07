const fs = require("fs");

/**
 * Read the test template
 */
let template = fs.readFileSync("code.template.js", { encoding: "utf8" });

/**
 * Retrieve sandbox from sandbox.json file
 */
let quarterfallData = {};
if (fs.existsSync("data.json")) {
    quarterfallData = JSON.parse(fs.readFileSync("data.json"));
}

let { input, code, qf, sandbox } = quarterfallData;

if (input) {
    fs.writeFileSync(`inputs.txt`, input.input);
}
// initial set of imports
let imports = [`const fs = require("fs")`];
const customImports = qf.imports || [];

// remove any imports that are already there
const customImportsNoWhiteSpace = customImports.map((i) =>
    i.replace(/\s|;/g, "")
);
imports = imports.filter(
    (i) => customImportsNoWhiteSpace.indexOf(i.replace(/\s|;/g, "")) < 0
);

// add the custom imports and insert them into the template
imports.push(...customImports);
template = template.split("/// {{IMPORTS}}").join(imports.join("\n"));

// use sandbox to create variables
let variables = [];

if (qf) {
    variables.push(`let qf = ${JSON.stringify(qf)}`);
}

if (sandbox) {
    for (const [key, value] of Object.entries(sandbox)) {
        variables.push(`let ${key} = ${JSON.stringify(value)}`);
    }
}

template = template.split("/// {{VARIABLES}}").join(variables.join(";\n"));

let codeString = code || qf.embeddedAnswer || qf.answer;
// insert the function into the template
template = template.split("/// {{CODE}}").join(codeString);

// store the template as a test file
fs.writeFileSync("code.js", template);
