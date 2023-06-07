#!/bin/bash
cd "$(dirname "$0")"

# build the test template
npm run build

# run the unit tests
npm test