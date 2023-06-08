#!/bin/bash
cd "$(dirname "$0")"

# write the answer to a source file
echo "$answer" > ./src/answer.hpp

# go to the src folder, build and test
cd src
make
./test