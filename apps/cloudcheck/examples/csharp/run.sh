# write the answer to a source file
echo "public class Answer { $answer }" > ./src/Answer.cs

# run the unit tests
cd src && dotnet run --nologo