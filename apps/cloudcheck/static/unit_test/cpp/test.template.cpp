/// {{IMPORTS}}

/// {{FUNC}}

int main() {

    /**
     * Before running the unit tests, load the data containing information about the block, the answers, and
     * any other data that was generated in earlier steps by other actions.
     */
    std::ifstream i("qf.json");
    nlohmann::json qf;
    i >> qf;

    /**
     * Add successful and failed test counts.
     */
    int successfulTestCount = 0;
    int failedTestCount = 0;

    /**
     * Run the tests
     */
    /// {{TESTS}}

    qf["successfulTestCount"] = successfulTestCount;
    qf["failedTestCount"] = failedTestCount;

    /**
     * Once the unit tests are completed, write the updated QF object to the JSON file.
     */
    std::ofstream o("qf.json");
    o << qf << std::endl;
}