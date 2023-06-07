# Cloud Check: Code Running Server

This code running server can run code in various programming languages. To achieve this, several code actions are provided, which can be supplied as part of a JSON object. The server then starts a pipeline to run actions and return the result.

# Installation

After retrieving the code from this repository, you can install the server dependencies using the following command (make sure you have Node.js installed on your machine):

```
npm install
```

# Running the server locally

You can start the server locally using the following command:

```
npm start
```

This will start the server on port 2700.

Note that the server relies on a bunch of different compilers and interpreters to run the code. If you have not installed these on your local machine, you'll run into issues.

# Running the server using the supplied Docker image

A better way to run the server locally is to use the Docker container instead, which also installs the tools needed to run code on the server. Here's how to build and run the Cloudcheck server using the Docker image:

```bash
export PORT=80
docker build . -t cloudcheck
docker run -p $PORT:2700 cloudcheck
```

# How to use Cloud Check

You can request to run code by doing a POST request to the root of the server. To achieve this, we have created a number of cloud check actions. Using these actions, you can create a pipeline and use this pipeline to run code and manipulate data. The body of the POST request is expected to be in the following shape,

```JSON
{
	"data": {...},
	"pipeline": [step1, step2, step3, ...]
}
```

The shape of the pipeline steps, step1, step2 etc., should be as follows,

```JSON
{
	"action": ACTION_TYPE,
	"options": {...}
}
```

You can then send a POST request to the cloudcheck endpoint with the data and pipeline.

```Typescript
const baseUrl = "http://localhost:2700"
const { data: result } = await axios.post(
    `${baseUrl}/cloudcheck`,
    {
        data,
        pipeline
    }
);
```

In the next section, detailed information will be provided for the set of actions that can be used within the pipeline.

## Cloud Check actions

### Run code

The run code action is very basic action to run full programs. It currently doesn't support external imports but this might be added in the future if there is a feature request. At the moment we support running code in the following programming languages: JavaScript, Java, Python, C#, C++, C, Golang and R.

```JSON
{
	"data": {...},
	"pipeline": [
		{
			"action": "run_code",
			"options": {
				"language": "python",
				"code": "print(f\"Hello World\")"
			}
		}
	]
}
```

### Run code with input

It is also possible to use the run code action with inputs for input-output(IO) testing.

```JSON
{
	"data": {...},
	"pipeline": [
		{
			"action": "run_code",
			"options": {
				"language": "python",
				"inputs": [
					{
						"input": "John"
					}
				],
				"code": "name = input();\nprint(f\"Hello, {name}!\")"
			}
		}
	]
}
```

Below are examples of how the code snippets would look, if you were to use the input-output for different languages.

#### Java

In Java you use a scanner to read input from System.in and you write output to System.out. Here is an example:

```Java
import java.util.Scanner;
class HelloWorld {
    public static void main(String[] args) {
        Scanner reader = new Scanner(System.in);
        int name = reader.nextLine();
        System.out.println("Hello, " + name);
    }
}
```

#### Python

IO in Python is very simple. Here is an example:

```Python
name = input()
print(f"Hello, {name}!")
```

#### C++

For C++ you need to use iostream. Here is an example:

```Cpp
#include <iostream>
int main() {
    std::string name;
    std::getline(std::cin, name);
    std::cout << "Hello, " + name;
    return 0;
}
```

#### C

For C you need to use stdio. Here is an example:

```C
#include <stdio.h>
int main() {
    char name[40];
    scanf("%39s", &name);
    printf("Hello, %s\n", name);
    return 0;
}
```

#### C#

For C# you read from and write to the console. Here is an example:

```Csharp
using System;
namespace Sample
{
    class Test
    {
        public static void Main(string[] args)
        {
            string name = Console.ReadLine();
            Console.WriteLine("Hello, " + name);
        }
    }
}
```

#### JavaScript

JavaScript does not directly support input. If you only want to use output, you can log to the console. Here is an example:

```Javascript
console.log("Hello, John");
```

We do though support the use of stdin from nodeJS. This is a bit more complicated. Here is an example.

```Javascript
const stdin = process.stdin;
let data = '';
stdin.on('data', function (chunk) {
	data += chunk;
});
stdin.on('end', function () {
	console.log("Hello, " + data);
});
```

#### Go

In Go, you need to use fmt. Here is an example:

```Go
package main
import "fmt"
func main() {
	var i string
	fmt.Scan(&i)
	fmt.Println("Your name is:", i)
}
```

#### R

For R, we need to use Rscript. In Rscript, to be able to use piped input, we need to open a connection using "stdin". Once the connection is established, we are able read from the piped input file. Using the print function we are able to retrieve the stdout.

```R
#!/usr/bin/env Rscript
con <- file("stdin")
open(con, blocking=TRUE)
input <- readLines(con)
print(input)
close(con)
```

### Git action

In the git action, you can use your own git repository to perform more complicated actions than simply running code. Two scripts should be placed in a specified path (or the root folder if no path option is provided) in the repository to be cloned:

-   install.sh: this script should install any dependencies that you need or do other preparatory work.
-   run.sh: this script will be run the commands. Before the script is run, the system will place the data in a json file at the same location as the run.sh script. Also, all properties of your data will be available in the script as environment variables.

While running the run.sh script, you may read from and write data to the aforementioned json file. Once the script is completed, the final data contained in the json file will be returned as the result of the request.

To use the git action within the pipeline, we need to provide a git url and optionally a branch, path and private key.

```JSON
{
	"data": {...},
	"pipeline": [
		{
			"action": "git",
			"options": {
				"gitUrl": YOUR_GIT_URL_HERE,
				"gitBranch": YOUR_GIT_BRANCH_HERE,
				"gitPath": YOUR_GIT_PATH_HERE,
				"gitPrivateKey": YOUR_GIT_PRIVATE_KEY_HERE
			}
		}
	]
}
```

As the scripts are run for the first time, a cache of the repository and the dependencies will be created such that you don't have to wait everytime for them to be installed. The cache will be updated every 24 hours. There is an option called "forceOverrideCache", if you want to remove the cache everytime to run the action.

### Webhook action

You can use the webhook action to send data to and request data from third party APIs. To test this action, you can use the "/webhook_test" endpoint of this server as your webhook url.

```JSON
{
	"data": {...},
	"pipeline": [
		{
			"action": "webhook",
			"options": {
				"webhookUrl": YOUR_WEBHOOK_URL_HERE
			}
		}
	]
}
```

### Unit test action

In many programming exercises students need to write a function or method that produces a certain result. For such cases we have created a very easy-to-use unit test action. The idea is that you simply provide an expression or a short piece of code that tests the function or method. The code is then compiled and ran in the cloud, and the result of the test is returned. At the moment we support unit tests in the following programming languages: JavaScript, Java, Python, C#, C++ and C.

You need to provide the following options when defining tests,

-   name: The name of the test.
-   description: The description of the test.
-   isCode: Default the test is an expression. If you want more possibilities, switch this on and you can provide a piece of test code.
-   code: When using an expression you should simply provide an expression that is true or false. This typically contains a call to the function or method the student created. When using code instead of an expression you can provide a piece of testing code here. This must return true or false, depending on whether the test is successful.

```JSON
{
	"data": {...},
	"pipeline": [
		{
			"action": "unit_test",
			"options": {
				"language": "python",
				"code": "def power(x, n):\n\tresult = 1\n\tfor i in range(n):\n\t\tresult *= x\n\treturn result",
				"tests": [
					{
						"name": "Square of two",
						"description": "Test to check if square of two is equal to 4",
						"isCode": false,
						"code": "power(2,2) == 4"
					}
				]
			}
		}
	]
}
```

### Database action

A database action runs the queries on a database of your choice (mysql or postgresql) on Google Cloud. To make this work, you need to add three environment variables in your ".env" file depending on your database dialect.

```
CLOUDCHECK_MYSQL_HOST=
CLOUDCHECK_MYSQL_USER=
CLOUDCHECK_MYSQL_PASSWORD=
```

OR

```
CLOUDCHECK_POSTGRESQL_HOST=
CLOUDCHECK_POSTGRESQL_USER=
CLOUDCHECK_POSTGRESQL_PASSWORD=
```

These refer to you public IP of your database host, your username and password.

You can also use a hosted .sql file to predefine your databases using the databaseFileUrl option.

```JSON
{
	"data": {...},
	"pipeline": [
		{
			"action": "database",
			"options": {
				"databaseDialect": "mysql", //Either mysql or postgresql
				"databaseFileUrl": YOUR_DATABASE_FILE_URL_HERE
			}
		}
	]
}

```

### Conditional text action

In the conditional text action you provide a condition and a text that is sent along when this condition is true. You can, optionally, also provide a text that is sent along when the condition is false. The condition is a Boolean expression that can either refer to the data provided in the request or data produced by previous actions in the pipeline.

```JSON
{
	"data": {...},
	"pipeline": [
		{
			"action": "conditional_text",
			"options": {
				"condition": "2 === 2",
                "textOnMatch": "Correct!",
                "textOnMismatch": "Please try again!"
			}
		}
	]
}

```

## Pipeline step options

Below is the overview of all possible options for the pipeline steps.

```Typescript
export interface PipelineStepOptions {
    language: ProgrammingLanguage;
    hideFeedback?: boolean;
    answerEmbedding?: string;
    languageData?: any;
    stopOnMatch?: boolean;
    // For run code action
    code?: string;
    inputs?: { input?: string }[];
    // For unit test action
    imports?: string;
    tests?: UnitTest[];
    ioTests?: IOTest[];
    // For git action
    gitUrl?: string;
    gitBranch?: string;
    gitPrivateKey?: string;
    gitPath?: string;
    forceOverrideCache?: boolean;
    // For webhook action
    webhookUrl?: string;
    // For database action
    databaseDialect?: DatabaseDialect;
    databaseFileUrl?: string;
    // For conditional text action
    condition?: string;
    textOnMatch?: string;
    textOnMismatch?: string;
    // For scoring action
    scoreExpression?: string;
}
```
