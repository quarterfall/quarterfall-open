const expect = require("chai").expect;
const Power = require("../src/answer"); // this is where the answer provided by the student will be located
const fs = require("fs");

/**
 * Before running the unit tests, load the data containing information about the block, the answers, and
 * any other data that was generated in earlier steps by other actions.
 */
let qf = {};
if (fs.existsSync("qf.json")) {
    qf = JSON.parse(fs.readFileSync("qf.json"));
}

/**
 * Below is an example of how you could run unit tests on JavaScript code using Mocha. Depending on the outcome
 * of each unit test, the data in the QF object is changed.
 */
describe("Power function test using Mocha", function() {
    it("should correctly compute the power of a number", function(done) {
        try {
            expect(Power(2, 4)).to.equal(16);
            qf.powerCorrect = true;
            done();
        } catch (e) {
            // power is not correctly computed
            qf.powerCorrect = false;
            done(e);
        }
    });
    it("should correctly compute the power of a non-integer number", function(done) {
        try {
            expect(Power(1.5, 3)).to.equal(3.375);
            qf.powerNonIntegerCorrect = true;
            done();
        } catch (e) {
            // power of a non-integer number is not correctly computed
            qf.powerNonIntegerCorrect = false;
            done(e);
        }
    });
    it("should correctly work if n equals 0", function(done) {
        try {
            expect(Power(50, 0)).to.equal(1);
            qf.powerZero = true;
            done();
        } catch (e) {
            // power of a number to zero is not correctly computed
            qf.powerZero = false;
            done(e);
        }
    });

    /**
     * Once the unit tests are completed, write the updated QF object to the JSON file.
     * The Cloud check server will send the contents of this file back as a response, so the feedback
     * mechanism can use this data.
     */
    after(function(done) {
        fs.writeFileSync("qf.json", JSON.stringify(qf));
        done();
    });
});
