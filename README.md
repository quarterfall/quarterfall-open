# Quarterfall Open

Quarterfall is a platform that helps teachers create a hands-off, interactive learning environment for their students. We focus on ICT education. Our platform is built by ICT teachers who got frustrated with the lack of good tools that understand our needs and that provide the flexibility we require to teach ICT topics such as programming, databases or mathematics. Quarterfall is available for free as open source software.

-   [Quarterfall Open](#quarterfall-open)
    -   [What's inside?](#whats-inside)
        -   [Apps and Packages](#apps-and-packages)
        -   [Utilities](#utilities)
        -   [Database setup](#database-setup)
        -   [Build](#build)
        -   [Develop](#develop)
        -   [Important notice](#important-notice)
    -   [Deployment](#deployment)
        -   [Docker](#docker)
            -   [Prerequisites](#prerequisites)
            -   [Build and run](#build-and-run)
        -   [Deploy to Google Cloud](#deploy-to-google-cloud)

## What's inside?

This monorepo uses [Yarn](https://classic.yarnpkg.com/) as a package manager. It includes the following packages/apps:

### Apps and Packages

-   `frontend`: a [Next.js](https://nextjs.org/) app with [MUI](https://mui.com).
-   `backend` : an [express](https://expressjs.com/) server that runs database actions.
-   `cloudcheck`: an [express](https://expressjs.com/) server that can run various code snippets via POST requests.
-   `core`: utilities library shared by `app`, `analytics` and `cloudcheck` applications

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This turborepo has some additional tools already setup for you:

-   [TypeScript](https://www.typescriptlang.org/) for static type checking
-   [ESLint](https://eslint.org/) for code linting
-   [Prettier](https://prettier.io) for code formatting

### Database setup

This application uses MongoDB as a database. You can install MongoDB locally or use a cloud service like [MongoDB Atlas](https://www.mongodb.com/cloud/atlas). The database connection string can be configured in the `.env` file in the backend folder.

### Build

To build all apps and packages, run the following command:

```
yarn run build
```

### Develop

To develop all apps and packages, run the following command:

```
yarn start
```

### Important notice

When running the first time, you need to run a script for the backend, which creates an organization with an admin user. You can find this file in the `/apps/backend/scripts/createOrganization`. You need to edit the organization name and the email address. This is crucial, otherwise you won't be able to bypass the login screen. The script can be run (from the root folder) with the following command:

```
yarn run scripts
```

After doing this, you need to create a Sendgrid account and add the API key to the `.env` file in the backend folder. This is required for sending emails. You can create a Sendgrid account [here](https://signup.sendgrid.com/). You can find the API key in the [Sendgrid dashboard](https://app.sendgrid.com/). Once you have created an account, you need to create the templates for the emails. You can find which templates you need to add in the `/apps/backend/src/config.ts` file. These templates require dynamic values. If you search for the `config.sendgrid.templates` keyword in your IDE, you can see which values you need to include in your template. You can find more information about creating templates [here](https://sendgrid.com/docs/for-developers/sending-email/using-templates/).

## Deployment

### Docker

Each application can be run in a docker container. The docker-compose.yml file contains the configuration for the containers. This is the easiest way to run the application, as you don't need to install any dependencies on your machine.

#### Prerequisites

-   [Docker](https://docs.docker.com/get-docker/)
-   [Docker Compose](https://docs.docker.com/compose/install/)

#### Build and run

-   Build and run the docker containers

```
docker-compose -f docker-compose.yml up -d
```

-   Stop the docker containers

```
docker-compose -f docker-compose.yml down
```

-   Prune all docker containers

```
docker system prune -a
```

### Deploy to Google Cloud

This application can be deployed to Google Cloud. The following steps are required:

-   Create a Google Cloud Platform (GCP) account
-   Install the [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
-   Create a new project in the [Google Cloud Console](https://console.cloud.google.com/)
-   Enable billing for your project
-   Enable the [Google Artifact Registry API](https://cloud.google.com/artifact-registry/docs/docker/store-docker-container-images) to store docker images
-   You can deploy the application to either Cloud Run or Google Kubernetes Engine (GKE). For Cloud Run, you need to enable the Cloud Run API. For GKE, you need to enable the Kubernetes Engine API. For more information, see [Cloud Run Quickstart](https://cloud.google.com/run/docs/quickstarts/build-and-deploy) and [GKE Quickstart](https://cloud.google.com/kubernetes-engine/docs/quickstart).
-   If you plan to use:
    -   Database actions: Create a Cloud SQL instance for both postgres and mysql
    -   File storage: Create a [Cloud Storage](https://cloud.google.com/storage/docs/discover-object-storage-console) bucket
    -   Analytics: Create three [Cloud Functions](https://cloud.google.com/functions/docs/quickstart)
