<div align="center">

# 🗳️ Voting App — End-to-End DevOps & GitOps Project

<img src="https://img.shields.io/badge/DevOps-End--to--End-blueviolet?style=for-the-badge&logo=devops&logoColor=white"/>
<img src="https://img.shields.io/badge/Jenkins-Pipeline-D24939?style=for-the-badge&logo=jenkins&logoColor=white"/>
<img src="https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white"/>
<img src="https://img.shields.io/badge/Kubernetes-GitOps-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white"/>
<img src="https://img.shields.io/badge/ArgoCD-App--of--Apps-EF7B4D?style=for-the-badge&logo=argo&logoColor=white"/>
<img src="https://img.shields.io/badge/SonarQube-Quality%20Gate-4E9BCD?style=for-the-badge&logo=sonarqube&logoColor=white"/>
<img src="https://img.shields.io/badge/Trivy-Security%20Scan-1904DA?style=for-the-badge&logo=aquasecurity&logoColor=white"/>
<img src="https://img.shields.io/badge/Prometheus-Monitoring-E6522C?style=for-the-badge&logo=prometheus&logoColor=white"/>
<img src="https://img.shields.io/badge/Grafana-Dashboards-F46800?style=for-the-badge&logo=grafana&logoColor=white"/>
<img src="https://img.shields.io/badge/Loki-Logging-F5A623?style=for-the-badge&logo=grafana&logoColor=white"/>
<img src="https://img.shields.io/badge/Python-Flask-3776AB?style=for-the-badge&logo=python&logoColor=white"/>
<img src="https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
<img src="https://img.shields.io/badge/.NET-Worker-512BD4?style=for-the-badge&logo=dotnet&logoColor=white"/>
<img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white"/>
<img src="https://img.shields.io/badge/Redis-Queue-DC382D?style=for-the-badge&logo=redis&logoColor=white"/>
<img src="https://img.shields.io/badge/Docker%20Hub-Registry-2496ED?style=for-the-badge&logo=docker&logoColor=white"/>
<img src="https://img.shields.io/badge/Sealed%20Secrets-Encryption-6C63FF?style=for-the-badge&logo=kubernetes&logoColor=white"/>

<br/>
<br/>

> **A production-grade DevOps pipeline** that automates the full software delivery lifecycle of a multi-language voting application (Python, Node.js, .NET) — from source code, through security scanning and quality gates, to a fully monitored, autoscaled Kubernetes deployment — using GitOps with an ArgoCD **App-of-Apps** pattern.

</div>

> ⚠️ **Note:** The application source code (`vote`, `result`, `worker`) was not developed by me. This repository documents the **DevOps / Platform Engineering layer**: Jenkins CI pipelines, Kubernetes manifests (Kustomize), GitOps delivery (ArgoCD), secrets management, autoscaling, backup/restore, and full-stack monitoring & logging.

**Repository:** https://github.com/HoussemDhahri/Voting-app-End-to-End-Project

---

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [🏗️ Architecture](#️-architecture)
- [📁 Project Structure](#-project-structure)
- [🔄 CI/CD Pipeline](#-cicd-pipeline)
- [☸️ Kubernetes & GitOps](#️-kubernetes--gitops)
- [📈 Monitoring Stack](#-monitoring-stack)
- [🔐 Secrets Management](#-secrets-management)
- [⚙️ Prerequisites](#️-prerequisites)
- [🚀 Getting Started](#-getting-started)
- [🌍 Environments](#-environments)
- [📊 Autoscaling (HPA)](#-autoscaling-hpa)
- [🗺️ Roadmap](#️-roadmap)

---

## 🎯 Overview

This project implements a **complete DevOps pipeline** for a **multi-language voting application** (Python/Flask, Node.js, .NET). It demonstrates industry best practices for:

| Pillar | Implementation |
|--------|-----------------|
| 🔄 **Continuous Integration** | Jenkins pipelines (one per service) triggered on every push |
| 🛡️ **Quality & Security** | SonarQube quality gate + Trivy (filesystem, image & SBOM scanning) on every build |
| 📦 **Containerization** | Independent Dockerfiles per service, images pushed to Docker Hub |
| 🚢 **Continuous Delivery** | GitOps with **ArgoCD App-of-Apps** — Staging & Prod managed declaratively |
| ☸️ **Orchestration** | Kubernetes with Kustomize (`base` + environment `overlays`) |
| 🗄️ **Database** | PostgreSQL deployed as a `StatefulSet` |
| 📊 **Autoscaling** | Horizontal Pod Autoscaler (HPA) for `vote`, `result`, `worker` in production |
| 📈 **Monitoring** | Prometheus + Grafana + Alertmanager (Slack alerts) + Loki logging |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          DEVELOPER WORKFLOW                              │
│                                                                          │
│   git push ──► GitHub ──► Webhook ──► Jenkins (vote / result / worker)  │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │       JENKINS CI/CD          │
                    │                              │
                    │  ✅ Checkout & Build          │
                    │  🧪 Lint + Unit Tests         │
                    │  🛡️  Trivy FS Scan            │
                    │  📊 SonarQube + Quality Gate  │
                    │  🐳 Docker Build              │
                    │  🛡️  Trivy Image Scan + SBOM  │
                    │  📤 Push to Docker Hub        │
                    │  🔄 Update Kustomize Image     │
                    │  🔄 Git Push (GitOps repo)     │
                    └──────┬────────────┬──────────┘
                           │            │
               ┌───────────▼──┐    ┌────▼────────────┐
               │  Docker Hub  │    │   GitHub Repo    │
               │  (registry)  │    │ (GitOps Source)  │
               └──────────────┘    └────────┬─────────┘
                                            │
                               ┌────────────▼─────────────┐
                               │         ArgoCD             │
                               │   App-of-Apps Pattern      │
                               └──┬──────────┬────────┬───┘
                                  │          │        │
                      ┌───────────▼──┐  ┌────▼───────┐│
                      │   STAGING    │  │    PROD    ││
                      │              │  │(voting-prod)││
                      │  vote        │  │  vote      ││
                      │  result      │  │  result    ││
                      │  worker      │  │  worker    ││
                      │  redis       │  │  redis     ││
                      │  postgres    │  │  postgres  ││
                      │  pgAdmin     │  │  HPA       ││
                      │  RedisInsight│  │  Ingress   ││
                      │              │  │  Backup/DR ││
                      └──────────────┘  └────────────┘│
                                                       │
                                          ┌────────────▼──────────────┐
                                          │     monitoring namespace    │
                                          │                             │
                                          │  📈 Prometheus               │
                                          │  📊 Grafana                  │
                                          │  🔔 Alertmanager → Slack     │
                                          │  📜 Loki + Promtail          │
                                          └─────────────────────────────┘
```

### Application data flow

```
                ┌──────────┐   votes   ┌───────────┐
   User ───────▶│   Vote   │──────────▶│   Redis   │
                │ (Python/ │           │  (queue)  │
                │  Flask)  │           └─────┬─────┘
                └──────────┘                 │
                                              ▼
                                        ┌───────────┐
                                        │  Worker   │
                                        │  (.NET)   │
                                        └─────┬─────┘
                                              │
                                              ▼
                ┌──────────┐           ┌───────────┐
   User ◀───────│  Result  │◀──────────│ Postgres  │
                │(Node.js) │           │    (db)   │
                └──────────┘           └───────────┘
```

| Service      | Stack           | Role                                                  |
|--------------|-----------------|--------------------------------------------------------|
| **vote**     | Python / Flask  | Front-end where users cast a vote                       |
| **redis**    | Redis           | In-memory queue collecting incoming votes                |
| **worker**   | .NET / C#       | Background worker consuming votes from Redis → Postgres  |
| **postgres** | PostgreSQL      | Persistent storage of votes (StatefulSet)                 |
| **result**   | Node.js         | Front-end displaying live results                         |

---

## 📁 Project Structure

```
Voting-app-End-to-End-Project/
│
├── Application-Code/
│   ├── vote/                          # Python/Flask front-end source
│   ├── result/                        # Node.js front-end source
│   └── worker/                        # .NET background worker source
│
├── Jenkinsfile-vote                   # CI/CD pipeline for "vote" (Python)
├── Jenkinsfile-result                 # CI/CD pipeline for "result" (Node.js)
├── Jenkinsfile-worker                 # CI/CD pipeline for "worker" (.NET)
│
└── Kubernetes-Manifests-file/
    │
    ├── argocd/
    │   ├── app-of-apps.yaml            # Root ArgoCD Application (App-of-Apps)
    │   └── applications/
    │       ├── staging.yaml            # ArgoCD Application → overlays/staging
    │       ├── prod.yaml               # ArgoCD Application → overlays/prod
    │       └── monitoring.yaml         # ArgoCD Application → monitoring stack
    │
    ├── base/                           # Environment-agnostic Kustomize base
    │   ├── postgres/                   # StatefulSet, PVC, Secret, ConfigMap, Service
    │   ├── redis/                      # StatefulSet, PVC, Service
    │   ├── result/                     # Deployment, Service, ConfigMap, Secret
    │   ├── vote/                       # Deployment, Service, ConfigMap
    │   └── worker/                     # Deployment, ConfigMap, Secret
    │
    ├── monitoring/                     # Full observability stack (Kustomize)
    │   ├── kustomization.yaml          # Aggregates servicemonitors, rules, grafana, alertmanager
    │   ├── alertmanager/                # AlertmanagerConfig + Slack webhook (Sealed Secret)
    │   ├── grafana/dashboards/          # Dashboards-as-code
    │   ├── prometheus-rules/            # PrometheusRule objects per component
    │   └── servicemonitors/             # ServiceMonitor for vote & result
    │
    └── overlays/
        ├── prod/
        │   ├── backup/                  # Postgres backup CronJob
        │   ├── hpa/                     # HPA for vote, result, worker
        │   ├── ingress/                 # Public ingress
        │   ├── restore/                 # Restore Job (disaster recovery)
        │   └── secrets/                 # Sealed Secrets (prod)
        │
        └── staging/
            ├── pgadmin/                 # pgAdmin (DB inspection)
            ├── redisinsight/            # RedisInsight (Redis inspection)
            └── secrets/                 # Sealed Secrets (staging)
```

---

## 🔄 CI/CD Pipeline

Each service has its own **declarative Jenkins pipeline**, triggered automatically on `githubPush()`:

```
🧹 Clean Workspace
    │
    ▼
📥 Checkout (GitHub)
    │
    ▼
🏷️  Set Image Tag ─────────────── git tag, or sha-<short-commit> fallback
    │
    ▼
⚙️  Install Dependencies ───────── pip/venv · npm ci · dotnet restore
    │
    ▼
⚡ Quality Checks (parallel) ───── Lint + Unit Tests (coverage, JUnit)
    │
    ▼
🛡️  Trivy Filesystem Scan ──────── vuln + secret scan (HIGH/CRITICAL)
    │
    ▼
📊 SonarQube Analysis
    │
    ▼
🚦 Quality Gate ─────────────────── pipeline aborts on failure
    │
    ▼
🐳 Docker Build ──────────────────── tagged {IMAGE_TAG} + latest
    │
    ▼
🛡️  Trivy Image Scan + SBOM ─────── fails hard on CRITICAL CVEs
    │
    ▼
📤 Push to Docker Hub
    │
    ▼
🔄 Update Staging (Kustomize + Git push) ──► ArgoCD auto-syncs
    │
    ▼
✋ Manual Approval (APPLY_PROD)
    │
    ▼
🔄 Update Prod (Kustomize + Git push) ──────► ArgoCD auto-syncs
```

### Pipelines

| Pipeline | Stack | Build tool |
|----------|-------|------------|
| `Jenkinsfile-vote` | Python | `pip`, `venv`, `flake8`, `pytest` |
| `Jenkinsfile-result` | Node.js | `npm ci`, `npm run lint`, `npm test` |
| `Jenkinsfile-worker` | .NET | `dotnet restore`, `dotnet format`, `dotnet build` |

> 🔑 **Key design point:** Jenkins never calls `kubectl apply` directly. It only updates the image tag inside the Kustomize manifests and pushes to Git — **ArgoCD is the only thing that ever talks to the cluster**, keeping the pipeline fully GitOps-compliant (Git as the single source of truth).

### Security & Quality Tooling

| Tool | What it does |
|------|----------------|
| **SonarQube** | Enforced quality gate per service (`Voting-Vote`, `Voting-Result`, `Voting-Worker`) |
| **Trivy (FS scan)** | Scans source code + detects leaked secrets (`HIGH`, `CRITICAL`) |
| **Trivy (image scan)** | Vulnerability report + **hard fail on CRITICAL CVEs** |
| **Trivy (SBOM)** | Generates a CycloneDX Software Bill of Materials, archived per build |

---

## ☸️ Kubernetes & GitOps

This project follows the **App-of-Apps** GitOps pattern with ArgoCD.

```yaml
# Kubernetes-Manifests-file/argocd/app-of-apps.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: voting-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/HoussemDhahri/Voting-app-End-to-End-Project.git
    targetRevision: main
    path: Kubernetes-Manifests-file/argocd/applications
  destination:
    server: https://kubernetes.default.svc
    namespace: argocd
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

### How It Works

1. `app-of-apps.yaml` is the single root Application applied to the cluster.
2. It watches `argocd/applications/`, which declares three child Applications:
   - `staging.yaml` → syncs `overlays/staging`
   - `prod.yaml` → syncs `overlays/prod`
   - `monitoring.yaml` → syncs the monitoring stack
3. Jenkins updates the image tag inside the relevant overlay's `kustomization.yaml` and pushes to `main`.
4. With `prune: true` and `selfHeal: true`, ArgoCD detects the diff and automatically syncs — and reverts any manual drift back to match Git.

```bash
kubectl apply -f Kubernetes-Manifests-file/argocd/app-of-apps.yaml
```

### Application Components (per environment)

| Component | Manifest Source | Type |
|-----------|------------------|------|
| **vote** | `base/vote` | Deployment + Service + ConfigMap |
| **result** | `base/result` | Deployment + Service + ConfigMap + Secret |
| **worker** | `base/worker` | Deployment + ConfigMap + Secret |
| **postgres** | `base/postgres` | StatefulSet + PVC + Service + Secret |
| **redis** | `base/redis` | StatefulSet + PVC + Service |

---

## 📈 Monitoring Stack

### Metrics — Prometheus

`ServiceMonitor` resources (label `release: monitoring`) scrape `vote` and `result` directly in the **`voting-prod`** namespace, every `15s` on the `/metrics` endpoint.

Infrastructure-level metrics are collected via dedicated exporters:

| Exporter | Purpose |
|----------|---------|
| `postgres-exporter` | Database performance & health |
| `redis-exporter` | Queue / cache metrics |
| `blackbox-exporter` | External HTTP/TCP probing (uptime checks) |

Alerting rules live in `monitoring/prometheus-rules/`: `postgres-alerts.yaml`, `redis-alerts.yaml`, `result-alerts.yaml`, `vote-alerts.yaml`, `worker-alerts.yaml`.

### Alerting — Alertmanager → Slack

Alerts are routed to a dedicated **`#voting-alerts`** Slack channel:

- Grouped by `alertname` and `namespace`
- `groupWait: 30s` · `groupInterval: 5m` · `repeatInterval: 1h`
- Rich formatting: application, alert name, severity, namespace, pod, description
- Resolved-notifications enabled
- Webhook URL stored as a **Sealed Secret**, never committed in plaintext

### Dashboards — Grafana

| Dashboard | Focus |
|-----------|-------|
| `voting-app-overview.yaml` | High-level system health |
| `vote-dashboard.yaml` / `result-dashboard.yaml` | Per-service metrics |
| `postgres-dashboard.yaml` / `redis-dashboard.yaml` | Datastore health |
| `blackbox-dashboard.yaml` | Uptime / probe results |
| `voting-logs-dashboard.yaml` | Log exploration (via Loki) |

### Logging — Loki & Promtail

Promtail ships container logs to Loki; Grafana queries them alongside metrics for correlated troubleshooting — jump from an error-rate spike straight to the relevant logs in the same dashboard.

---

## 🔐 Secrets Management

All secrets are encrypted at rest in Git using **Sealed Secrets** (Bitnami controller) — only the target cluster's controller can decrypt them:

| Location | Secrets |
|----------|---------|
| `overlays/prod/secrets/` | Postgres, result, and worker credentials (production) |
| `overlays/staging/secrets/` | Same set, scoped to staging |
| `monitoring/alertmanager/` | Slack webhook for Alertmanager |

---

## ⚙️ Prerequisites

| Tool | Purpose |
|------|---------|
| **Jenkins** | CI/CD orchestration |
| **Docker** | Container builds |
| **Kustomize** | K8s manifest patching |
| **ArgoCD** | GitOps controller |
| **Kubernetes** | Container orchestration |
| **Sealed Secrets controller** | Secrets encryption at rest |
| **SonarQube server** | Code quality gate |
| **Trivy** | Security scanning |
| **Metrics Server** | Required for HPA to function |

### Jenkins Credentials Required

| Credential ID | Type | Usage |
|--------------|------|-------|
| `Dockerhub` | Username/Password | Docker Hub image push |
| `github-token` | Username/Password | GitHub checkout & GitOps push |

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/HoussemDhahri/Voting-app-End-to-End-Project.git
cd Voting-app-End-to-End-Project
```

### 2. Install ArgoCD

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

### 3. Install the Sealed Secrets Controller

```bash
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/latest/download/controller.yaml
```

### 4. Bootstrap with App-of-Apps

```bash
kubectl apply -f Kubernetes-Manifests-file/argocd/app-of-apps.yaml
```

This single command bootstraps **staging**, **prod**, and **monitoring** through ArgoCD automatically.

```bash
kubectl get applications -n argocd
```

### 5. Preview Manifests Locally (without ArgoCD)

```bash
kubectl kustomize Kubernetes-Manifests-file/overlays/staging
kubectl kustomize Kubernetes-Manifests-file/overlays/prod
kubectl kustomize Kubernetes-Manifests-file/monitoring
```

### 6. Trigger a Deployment

```bash
git push origin main
# Jenkins webhook fires → vote/result/worker pipeline starts automatically
# → auto-updates staging → ArgoCD syncs
# → re-run with APPLY_PROD=true + manual approval → promotes to prod
```

---

## 🌍 Environments

| Environment | Overlay Path | Namespace | Notes |
|--------------|--------------|-----------|-------|
| **Staging** | `overlays/staging` | `voting-staging` | Includes pgAdmin & RedisInsight for debugging; auto-updated on every push |
| **Production** | `overlays/prod` | `voting-prod` | HPA, Ingress, automated backups, disaster recovery; requires manual approval (`APPLY_PROD`) |

---

## 📊 Autoscaling (HPA)

| Overlay File | Purpose |
|--------------|---------|
| `overlays/prod/hpa/hpa-vote.yaml` | Scales `vote` based on resource utilization |
| `overlays/prod/hpa/hpa-result.yaml` | Scales `result` based on resource utilization |
| `overlays/prod/hpa/hpa-worker.yaml` | Scales `worker` based on resource utilization |

> HPA is only enabled in **production** — staging runs at a fixed, minimal replica count to save resources.

---

## 🗺️ Roadmap

- [ ] Add Terraform for underlying infrastructure provisioning
- [ ] Add TLS / cert-manager integration for Ingress
- [ ] Add SLO-based (burn-rate) alerting
- [ ] Add ServiceMonitors for `worker`, `postgres-exporter`, and `redis-exporter` explicitly

---

<div align="center">

**Built with ❤️ — Voting App DevOps End-to-End Project**

<img src="https://img.shields.io/badge/GitOps-ArgoCD-orange?style=flat-square"/>
<img src="https://img.shields.io/badge/Pipeline-Jenkins-D24939?style=flat-square"/>
<img src="https://img.shields.io/badge/Quality-SonarQube-4E9BCD?style=flat-square"/>
<img src="https://img.shields.io/badge/Security-Trivy-1904DA?style=flat-square"/>
<img src="https://img.shields.io/badge/Monitoring-Prometheus%20%2B%20Grafana-F46800?style=flat-square"/>
<img src="https://img.shields.io/badge/Alerts-Slack-4A154B?style=flat-square"/>
<img src="https://img.shields.io/badge/License-MIT-green?style=flat-square"/>

</div>