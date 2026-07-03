# .NET SDK 8 + Java 17 Docker Image

This directory contains a custom Docker image used by the Jenkins CI/CD pipeline.

## Purpose

The official Microsoft .NET SDK image (`mcr.microsoft.com/dotnet/sdk:8.0`) does not include Java, which is required by the SonarScanner for .NET during the `end` analysis step.

To avoid installing Java during every pipeline execution, this image extends the official .NET SDK image by adding OpenJDK 17 Runtime.

## Base Image

```text
mcr.microsoft.com/dotnet/sdk:8.0
```

## Installed Components

* .NET SDK 8
* OpenJDK 17 Runtime (JRE)

## Dockerfile

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0

RUN apt-get update && \
    apt-get install -y --no-install-recommends openjdk-17-jre && \
    rm -rf /var/lib/apt/lists/*
```

## Build the Image

```bash
docker build -t houssemdhahri93/dotnet-sdk-java17 .
```

## Push to Docker Hub

```bash
docker push houssemdhahri93/dotnet-sdk-java17
```

## Usage

This image is intended to be used only in the **SonarQube Analysis** stage of the Jenkins pipeline.

Example:

```groovy
agent {
    docker {
        image 'houssemdhahri93/dotnet-sdk-java17'
        args '--network jenkins-sonarqube'
        reuseNode true
    }
}
```

## Why a Custom Image?

Using a pre-built image provides several benefits:

* Faster pipeline execution
* No need to install Java on every build
* Consistent and reproducible build environment
* Based on the official Microsoft .NET SDK image
* Follows DevOps containerization best practices

## Repository

This image is part of the **Voting App End-to-End DevOps Project** and is used exclusively for CI/CD automation with Jenkins and SonarQube.
