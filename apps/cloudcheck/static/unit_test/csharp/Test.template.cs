/// {{IMPORTS}}

public class Test
{
    private JObject qf;

    private void ReadData()
    {
        /**
         * Before running the unit tests, load the data containing information about the block, the answers, and
         * any other data that was generated in earlier steps by other actions.
         */
        string qfText = File.ReadAllText("qf.json");
        qf = JObject.Parse(qfText);
    }

    private void WriteData()
    {
        /**
         * Once the unit tests are completed, write the updated qf object to the JSON file.
         * The Cloud check server will send the contents of this file back as a response, so the feedback
         * mechanism can use this data.
         */
        File.WriteAllText("qf.json", qf.ToString());
    }

    /**
	* Here, we're going to insert the method.
	*/
    /// {{FUNC}}

    private void RunTests()
    {

        /**
		* Successful and failed test counts.
		*/
        int successfulTestCount = 0;
        int failedTestCount = 0;

        /**
		* Here the tests are going to be inserted
		*/
        /// {{TESTS}}

        qf["successfulTestCount"] = successfulTestCount;
        qf["failedTestCount"] = failedTestCount;
    }

    public static void Main()
    {
        // Create the test application
        Test app = new Test();

        // Read the data from the qf.json file
        app.ReadData();

        // Run the tests
        app.RunTests();

        // Write the data
        app.WriteData();
    }
}