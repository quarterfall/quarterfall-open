# Quarterfall

Open source smart learning tool for ICT education.

## What's inside?

This monorepo uses [Yarn](https://classic.yarnpkg.com/) as a package manager. It includes the following packages/apps:

### Apps and Packages

-   `app`: a [Next.js](https://nextjs.org/) app with a [tRPC](https://trpc.io/) api
-   `cloudcheck`: an [express](https://expressjs.com/) server that can run various code snippets via POST requests.
-   `analytics`: [Google Cloud Functions](https://cloud.google.com/functions) for computing analytics
-   `ui`: a stub React component library used by `app`
-   `core`: utilities library shared by `app`, `analytics` and `cloudcheck` applications

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This turborepo has some additional tools already setup for you:

-   [TypeScript](https://www.typescriptlang.org/) for static type checking
-   [ESLint](https://eslint.org/) for code linting
-   [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo
yarn run build
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo
yarn run start
```

## Useful Links

Learn more about the power of Turborepo:

-   [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
-   [Caching](https://turbo.build/repo/docs/core-concepts/caching)
-   [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
-   [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
-   [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)

## Useful commands

-   Create a network, which allows containers to communicate with each other, by using their container name as a hostname

```
docker network create app_network
```

-   Run docker compose build

```
COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker-compose -f docker-compose.yml build
```

-   Start docker containers

```
docker-compose -f docker-compose.yml up -d
```

-   Prune all existing container, images and networks to save storage space.

```
docker system prune --all
```

-   Convert your .env file to a base64 encoded .txt file to be used in the Github actions

```
openssl base64 -A -in local.env -out local.txt
```
