/// {{IMPORTS}}

/**
 * Here, we're going to insert the function.
 */
/// {{FUNC}}

/**
 * Before running the unit tests, load the data containing information about the block, the answers, and
 * any other data that was generated in earlier steps by other actions.
 */
let qf = {};
if (fs.existsSync("qf.json")) {
    qf = JSON.parse(fs.readFileSync("qf.json"));
}

/**
 * Add successful and failed test counts.
 */
qf.successfulTestCount = 0;
qf.failedTestCount = 0;

/**
 * Here the tests are going to be inserted
 */
/// {{TESTS}}

/**
 * Once the unit tests are completed, write the updated QF object to the JSON file.
 */
fs.writeFileSync("qf.json", JSON.stringify(qf));
