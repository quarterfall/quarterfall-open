FROM node:16-bullseye AS builder

# Add github as a known host for SSH access
RUN mkdir ~/.ssh
RUN ssh-keyscan github.com >> ~/.ssh/known_hosts

# Install turbo and copy the application files using turbo prune
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=cloudcheck --docker

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

# Install basic dependencies from the package manager
RUN apt-get update && apt-get install -y \
    dirmngr \
    gnupg \
    apt-transport-https \
    ca-certificates \
    software-properties-common \
    gpg \
    unzip \
    default-jdk \
    maven \
    build-essential \
    python3 \
    python3-pip \
    cmake

# Install Python libraries
RUN python3 -m pip install scikit-learn pandas pandas-datareader numpy xlrd statsmodels openpyxl flake8

# Install Dotnet (needed for C# compilation)
RUN wget https://packages.microsoft.com/config/debian/11/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
RUN dpkg -i packages-microsoft-prod.deb
RUN rm packages-microsoft-prod.deb
RUN apt-get update
RUN apt-get install -y dotnet-sdk-6.0

# install Gradle (needed for Java compilation)
ENV GRADLE_VERSION=7.4
RUN curl -L https://services.gradle.org/distributions/gradle-$GRADLE_VERSION-bin.zip -o gradle-$GRADLE_VERSION-bin.zip
RUN unzip gradle-$GRADLE_VERSION-bin.zip
ENV GRADLE_HOME=/app/gradle-$GRADLE_VERSION
ENV PATH=$PATH:$GRADLE_HOME/bin
RUN echo "org.gradle.caching=true" > $GRADLE_HOME/gradle.properties
RUN echo "org.gradle.daemon=true" >> $GRADLE_HOME/gradle.properties

#install R package
RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-key '95C0FAF38DB3CCAD0C080A7BDC78B2DDEABC47B7'
RUN add-apt-repository 'deb http://cloud.r-project.org/bin/linux/debian bullseye-cran40/'
RUN apt-get update
RUN apt-get install -y r-base r-base-dev

#install Go library
RUN add-apt-repository -r ppa:longsleep/golang-backports
RUN apt-get update
RUN apt-get install -y golang-go
RUN go version

WORKDIR /app/apps/cloudcheck
# Give the user permission to run the start script
RUN chmod +x start.sh
# Define and expose the port
EXPOSE $PORT

# Start the node server
CMD [ "./start.sh" ]
#CMD [ "./node_modules/.bin/ts-node", "-r", "tsconfig-paths/register", "src/index.ts" ]