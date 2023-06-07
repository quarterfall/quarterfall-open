const fs = require("fs");

/**
 * Read the test template
 */
let template = fs.readFileSync("Test.template.cs", { encoding: "utf8" });

/**
 * Retrieve the unit test data from the qf.json file
 */
let qf = {};
if (fs.existsSync("qf.json")) {
    qf = JSON.parse(fs.readFileSync("qf.json"));
}

// initial set of imports
let imports = [
    `using System.IO;`,
    `using System;`,
    `using Newtonsoft.Json.Linq;`
];
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
template = template.split("/// {{IMPORTS}}").join(imports.join("\n"));

// insert the function into the template
template = template
    .split("/// {{FUNC}}")
    .join(qf.embeddedAnswer || qf.answer || "");

const tests = qf.tests || [];

// create the test code
let testCalls = "";
for (const test of tests) {
    if (test.isCode) {
        testCalls += `
            Func<bool> ${test.name} = () => {
                ${test.code}
            };
            qf["${test.name}"] = ${test.name}.Invoke();
        `;
    } else {
        testCalls += `qf["${test.name}"] = ${test.code};`;
    }
    // add the test count check
    testCalls += `
        if ((bool)qf["${test.name}"]) {
            successfulTestCount += 1;
        } else {
            failedTestCount += 1;
        }
    `;
}

// insert the tests into the template
template = template.split("/// {{TESTS}}").join(testCalls);

// store the template as a test file
fs.writeFileSync("Test.cs", template);
