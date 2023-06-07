import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
 
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

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

	private void RunTests() {
		// Create an instance of Answer
		Answer answer = new Answer();
	
		// Test whether the Power function computes the power correctly
		this.data.put("powerCorrect", answer.Power(2, 4) == 16);

		// Test whether the Power function computes the power correctly for a non-integer number
		this.data.put("powerNonIntegerCorrect", answer.Power(1.5, 3) == 3.375);

		// Test whether the Power function computes the power correctly for exponent 0
		this.data.put("powerZero", answer.Power(50, 0) == 1);
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