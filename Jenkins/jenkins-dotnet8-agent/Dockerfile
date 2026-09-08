FROM mcr.microsoft.com/dotnet/sdk:8.0

USER root

# ==========================================
# Install common dependencies + Java
# ==========================================
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        git \
        curl \
        unzip \
        ca-certificates \
        gnupg \
        openjdk-17-jdk \
    && rm -rf /var/lib/apt/lists/*

# ==========================================
# Install Docker CLI
# ==========================================
RUN curl -fsSL \
    https://download.docker.com/linux/static/stable/x86_64/docker-27.3.1.tgz \
    -o docker.tgz && \
    tar xzf docker.tgz \
        --strip-components=1 \
        -C /usr/local/bin docker/docker && \
    rm docker.tgz

# ==========================================
# Install Trivy
# ==========================================
RUN curl -L \
    https://github.com/aquasecurity/trivy/releases/download/v0.72.0/trivy_0.72.0_Linux-64bit.tar.gz \
    -o trivy.tar.gz && \
    tar zxvf trivy.tar.gz trivy && \
    mv trivy /usr/local/bin/trivy && \
    chmod +x /usr/local/bin/trivy && \
    rm trivy.tar.gz

# ==========================================
# Install kubectl
# ==========================================
RUN curl -LO \
    https://dl.k8s.io/release/v1.34.1/bin/linux/amd64/kubectl && \
    install \
        -o root \
        -g root \
        -m 0755 \
        kubectl \
        /usr/local/bin/kubectl && \
    rm kubectl

# ==========================================
# Install kustomize
# ==========================================
RUN curl -L \
    https://github.com/kubernetes-sigs/kustomize/releases/download/kustomize%2Fv5.7.1/kustomize_v5.7.1_linux_amd64.tar.gz \
    -o kustomize.tar.gz && \
    tar -xzf kustomize.tar.gz && \
    mv kustomize /usr/local/bin/kustomize && \
    chmod +x /usr/local/bin/kustomize && \
    rm kustomize.tar.gz

# ==========================================
# Java Configuration
# ==========================================
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH="${JAVA_HOME}/bin:/usr/local/bin:${PATH}"

# ==========================================
# Jenkins User + .NET Configuration
# ==========================================
RUN groupadd -g 1000 jenkins && \
    useradd -u 1000 -g 1000 -m -d /home/jenkins -s /bin/bash jenkins

ENV HOME=/home/jenkins
ENV DOTNET_CLI_HOME=/home/jenkins
ENV NUGET_PACKAGES=/home/jenkins/.nuget/packages

RUN mkdir -p \
        /home/jenkins/.nuget/packages && \
    chown -R jenkins:jenkins /home/jenkins && \
    chmod -R u+rwX /home/jenkins

# ==========================================
# Install SonarScanner for .NET
# ==========================================
RUN dotnet tool install \
    --tool-path /usr/local/bin \
    dotnet-sonarscanner \
    --version 11.0.0

# ==========================================
# Fix Jenkins Home Ownership
# ==========================================
RUN chown -R jenkins:jenkins /home/jenkins

# ==========================================
# Verify Jenkins User Environment
# ==========================================
USER jenkins

RUN mkdir -p \
        "$DOTNET_CLI_HOME" \
        "$NUGET_PACKAGES" && \
    touch "$DOTNET_CLI_HOME/test-file" && \
    touch "$NUGET_PACKAGES/test-file" && \
    rm "$DOTNET_CLI_HOME/test-file" "$NUGET_PACKAGES/test-file"

# ==========================================
# Validation
# ==========================================
RUN java -version && \
    dotnet --version && \
    git --version && \
    docker --version && \
    trivy --version && \
    kubectl version --client && \
    kustomize version && \
    dotnet tool list --tool-path /usr/local/bin

# ==========================================
# Runtime
# ==========================================
WORKDIR /home/jenkins
USER jenkins