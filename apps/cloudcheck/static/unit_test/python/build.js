const fs = require("fs");

/**
 * Read the test template
 */
let template = fs.readFileSync("test.template.py", { encoding: "utf8" });

/**
 * Retrieve the unit test data from the qf.json file
 */
let qf = {};
if (fs.existsSync("qf.json")) {
    qf = JSON.parse(fs.readFileSync("qf.json"));
}

// initial set of imports
let imports = [`import json`, `import os.path`];
const customImports = qf.imports || [];

// remove any imports that are already there
const customImportsNoWhiteSpace = customImports.map(i =>
    i.replace(/\s|;/g, "")
);
imports = imports.filter(
    i => customImportsNoWhiteSpace.indexOf(i.replace(/\s|;/g, "")) < 0
);

// add the custom imports and insert them into the template
imports.push(...customImports);
template = template.split("# {{IMPORTS}}").join(imports.join("\n"));

// insert the function into the template
template = template.split("# {{FUNC}}").join(qf.embeddedAnswer || qf.answer);

const tests = qf.tests || [];

// create the test code
let testCalls = "";
for (const test of tests) {
    if (test.isCode) {
        const codeLines = test.code
            .split("\n")
            .map(line => `\t\t${line}`)
            .join("\n");
        testCalls += `\tdef ${test.name}_fun():\n${codeLines}\n\tqf['${test.name}'] = ${test.name}_fun()\n`;
    } else {
        testCalls += `\tqf['${test.name}'] = ${test.code}\n`;
    }
    // add the test count check
    testCalls += `\tif qf['${test.name}']:\n\t\tqf['successfulTestCount'] += 1\n\telse:\n\t\tqf['failedTestCount'] += 1\n`;
}

// insert the tests into the template
template = template.split("# {{TESTS}}").join(testCalls);

// replace all tabs by spaces for consistency
template = template.replace(/\t/g, "    ");

// store the template as a test file
fs.writeFileSync("test.py", template);
