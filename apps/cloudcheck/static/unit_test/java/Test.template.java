/// {{IMPORTS}}

// This interface defines how we'll call the lambda expressions
interface TestFunc
{
    boolean run();
} 

class Test 
{
	private JSONObject data;

	private void ReadData() {
		// JSON parser object to parse read file
        JSONParser jsonParser = new JSONParser();
         
        try (FileReader reader = new FileReader("qf.json"))
        {
            // Read JSON file
            this.data = (JSONObject) jsonParser.parse(reader);
 
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (ParseException e) {
            e.printStackTrace();
        }
	}

	private void WriteData() {
		// Write JSON file
        try (FileWriter file = new FileWriter("qf.json")) {
 
            file.write(this.data.toJSONString());
            file.flush();
 
        } catch (IOException e) {
            e.printStackTrace();
        }
	}

	/**
	* Here, we're going to insert the method.
	*/
	/// {{FUNC}}

	private void RunTests() {

		/**
		* Successful and failed test counts.
		*/
		int successfulTestCount = 0;
		int failedTestCount = 0;

		/**
		* Here the tests are going to be inserted
		*/
		/// {{TESTS}}

		this.data.put("successfulTestCount", successfulTestCount);
		this.data.put("failedTestCount", failedTestCount);
	}

	public static void main(String args[]) 
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