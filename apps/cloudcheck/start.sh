#!/bin/bash

gradle --daemon
./node_modules/.bin/ts-node -r tsconfig-paths/register src/index.ts