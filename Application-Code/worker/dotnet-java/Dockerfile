FROM mcr.microsoft.com/dotnet/sdk:8.0

RUN apt-get update && \
    apt-get install -y --no-install-recommends openjdk-17-jre && \
    rm -rf /var/lib/apt/lists/*