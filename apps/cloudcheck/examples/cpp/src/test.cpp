#include "json.hpp"
#include "answer.hpp" // this is where the answer provided by the student will be located
#include <fstream>
#include <iostream>
using namespace std;

// for convenience
using json = nlohmann::json;

int main() {

    /**
     * Before running the unit tests, load the data containing information about the block, the answers, and
     * any other data that was generated in earlier steps by other actions.
     */
    std::ifstream i("../qf.json");
    json qf;
    i >> qf;

    /**
     * Below is an example of how you could run tests on a C(++) function. Depending on the outcome
     * of each test, the data in the qf object is changed.
     */
    try {
        qf["powerCorrect"] = power(2, 4) == 16;
    } catch (...) {
      // power is not correctly computed
      qf["powerCorrect"] = false;
    }

    try {
        qf["powerNonIntegerCorrect"] = power(1.5, 3) == 3.375;
    } catch (...) {
      // power of a non-integer number is not correctly computed
      qf["powerNonIntegerCorrect"] = false;
    }

    try {
        qf["powerZero"] = power(50, 0) == 1;
    } catch (...) {
      // power of a non-integer number is not correctly computed
      qf["powerZero"] = false;
    }

    /**
     * Once the unit tests are completed, write the updated QF object to the JSON file.
     * The Cloud check server will send the contents of this file back as a response, so the feedback
     * mechanism can use this data.
     */
    std::ofstream o("../qf.json");
    o << qf << std::endl;
}