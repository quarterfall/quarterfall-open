using System.IO;
using Newtonsoft.Json.Linq;

public class Test
{
    private JObject qf;

    private void ReadData()
    {
        /**
         * Before running the unit tests, load the data containing information about the block, the answers, and
         * any other data that was generated in earlier steps by other actions.
         */
        string qfText = File.ReadAllText("../qf.json");
        this.qf = JObject.Parse(qfText);
    }

    private void WriteData()
    {
        /**
         * Once the unit tests are completed, write the updated qf object to the JSON file.
         * The Cloud check server will send the contents of this file back as a response, so the feedback
         * mechanism can use this data.
         */
        File.WriteAllText("../qf.json", this.qf.ToString());
    }

    private void RunTests()
    {
        // Create an instance of Answer
        Answer answer = new Answer();

        try
        {
            qf["powerCorrect"] = answer.Power(2, 4) == 16;
        }
        catch
        {
            // power is not correctly computed
            qf["powerCorrect"] = false;
        }

        try
        {
            qf["powerNonIntegerCorrect"] = answer.Power(1.5, 3) == 3.375;
        }
        catch
        {
            // power of a non-integer number is not correctly computed
            qf["powerNonIntegerCorrect"] = false;
        }

        try
        {
            qf["powerZero"] = answer.Power(50, 0) == 1;
        }
        catch
        {
            // power of a non-integer number is not correctly computed
            qf["powerZero"] = false;
        }
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