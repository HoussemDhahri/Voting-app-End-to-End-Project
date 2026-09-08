FROM python:3.13-slim

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
        openjdk-21-jdk \
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
ENV JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
ENV PATH="${JAVA_HOME}/bin:/usr/local/bin:${PATH}"


# ==========================================
# Python Configuration
# ==========================================
ENV PYTHONUNBUFFERED=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV PIP_NO_CACHE_DIR=1
ENV PIP_ROOT_USER_ACTION=ignore
ENV HOME=/home/jenkins


# ==========================================
# Install SonarScanner CLI
# ==========================================
RUN curl -L \
    https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-7.2.0.5079-linux-x64.zip \
    -o sonar-scanner.zip && \
    unzip sonar-scanner.zip -d /opt && \
    mv /opt/sonar-scanner-* /opt/sonar-scanner && \
    ln -s /opt/sonar-scanner/bin/sonar-scanner /usr/local/bin/sonar-scanner && \
    rm sonar-scanner.zip


# ==========================================
# Install Python Dev Tools
# ==========================================
RUN pip install \
        pytest \
        pytest-cov \
        pylint \
        black \
        flake8


# ==========================================
# Create Jenkins Home
# ==========================================
RUN mkdir -p /home/jenkins && \
    chown -R 1000:1000 /home/jenkins


# ==========================================
# Validation
# ==========================================
RUN java -version && \
    python --version && \
    pip --version && \
    git --version && \
    docker --version && \
    trivy --version && \
    kubectl version --client && \
    kustomize version && \
    sonar-scanner --version


# ==========================================
# Runtime
# ==========================================
WORKDIR /home/jenkins