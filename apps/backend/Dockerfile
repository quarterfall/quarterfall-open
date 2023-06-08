FROM node:16-bullseye AS builder

# Install turbo and copy the application files using turbo prune
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=backend --docker

# Install the dependencies from root lockfile
FROM node:16-bullseye AS installer
WORKDIR /app

COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN yarn install

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .

FROM node:16-bullseye AS runner
WORKDIR /app

COPY --from=installer /app .

WORKDIR /app/apps/backend
# Define and expose the port
EXPOSE $PORT

# Start the node server
CMD [ "./node_modules/.bin/ts-node", "-r", "tsconfig-paths/register", "src/index.ts" ]