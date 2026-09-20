<div align="center">

# 🗳️ Voting App — End-to-End DevOps & GitOps Project

<img src="https://img.shields.io/badge/DevOps-End--to--End-blueviolet?style=for-the-badge&logo=devops&logoColor=white"/>
<img src="https://img.shields.io/badge/Jenkins-Pipeline-D24939?style=for-the-badge&logo=jenkins&logoColor=white"/>
<img src="https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white"/>
<img src="https://img.shields.io/badge/Kubernetes-GitOps-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white"/>
<img src="https://img.shields.io/badge/Kustomize-Base%20%2B%20Overlays-7B42BC?style=for-the-badge&logo=kubernetes&logoColor=white"/>
<img src="https://img.shields.io/badge/ArgoCD-App--of--Apps-EF7B4D?style=for-the-badge&logo=argo&logoColor=white"/>
<img src="https://img.shields.io/badge/SonarQube-Quality%20Gate-4E9BCD?style=for-the-badge&logo=sonarqube&logoColor=white"/>
<img src="https://img.shields.io/badge/Trivy-Security%20Scan-1904DA?style=for-the-badge&logo=aquasecurity&logoColor=white"/>
<img src="https://img.shields.io/badge/Prometheus-Monitoring-E6522C?style=for-the-badge&logo=prometheus&logoColor=white"/>
<img src="https://img.shields.io/badge/Grafana-Dashboard%20as%20Code-F46800?style=for-the-badge&logo=grafana&logoColor=white"/>
<img src="https://img.shields.io/badge/Alertmanager-Slack-4A154B?style=for-the-badge&logo=slack&logoColor=white"/>
<img src="https://img.shields.io/badge/k6-Load%20Testing-7D64FF?style=for-the-badge&logo=k6&logoColor=white"/>
<img src="https://img.shields.io/badge/Sealed%20Secrets-Encryption-6C63FF?style=for-the-badge&logo=kubernetes&logoColor=white"/>
<img src="https://img.shields.io/badge/Python-Flask-3776AB?style=for-the-badge&logo=python&logoColor=white"/>
<img src="https://img.shields.io/badge/Node.js-Result-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
<img src="https://img.shields.io/badge/.NET%208-Worker-512BD4?style=for-the-badge&logo=dotnet&logoColor=white"/>
<img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white"/>
<img src="https://img.shields.io/badge/Redis-Queue-DC382D?style=for-the-badge&logo=redis&logoColor=white"/>

<br/>
<br/>

> **A production-grade DevOps platform** around a multi-language voting application (Python, Node.js, .NET 8) — from source code, through security scanning and quality gates, to a fully monitored, autoscaled and load-tested Kubernetes deployment — delivered with GitOps using the ArgoCD **App-of-Apps** pattern.

</div>

> ⚠️ **Note:** The application source code (`vote`, `result`, `worker`) was **not written by me**. This repository documents the **DevOps / Platform Engineering layer** I built on top of it: Jenkins CI pipelines and custom build agents, Kubernetes manifests with Kustomize, GitOps delivery with ArgoCD, Sealed Secrets, autoscaling, backup & restore, load testing, and the full monitoring / alerting stack.

**Repository:** https://github.com/HoussemDhahri/Voting-app-End-to-End-Project

---

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [🏗️ Architecture](#️-architecture)
- [📁 Project Structure](#-project-structure)
- [🔄 CI/CD Pipeline](#-cicd-pipeline)
- [🧱 Custom Jenkins Agents](#-custom-jenkins-agents)
- [☸️ Kubernetes & GitOps](#️-kubernetes--gitops)
- [🌍 Environments](#-environments)
- [📈 Monitoring Stack](#-monitoring-stack)
- [🔔 Alerting](#-alerting)
- [📊 Autoscaling (HPA)](#-autoscaling-hpa)
- [🧪 Load Testing (k6)](#-load-testing-k6)
- [💾 Backup & Restore](#-backup--restore)
- [🔐 Secrets Management](#-secrets-management)
- [⚙️ Prerequisites](#️-prerequisites)
- [🚀 Getting Started](#-getting-started)

---

## 🎯 Overview

| Pillar | Implementation |
|--------|----------------|
| 🔄 **Continuous Integration** | Three independent Jenkins pipelines (`vote`, `result`, `worker`), triggered by `githubPush()` |
| 🧱 **Build Agents** | Custom Docker agents for Python and .NET 8, pre-loaded with Trivy, kubectl, kustomize and SonarScanner |
| 🛡️ **Quality & Security** | SonarQube quality gate (aborts the build) + Trivy filesystem, secret and image scanning |
| 📦 **Containerization** | One image per service, tagged from the Git tag (or `sha-<commit>`), pushed to Docker Hub |
| 🚢 **Continuous Delivery** | GitOps with the **ArgoCD App-of-Apps** pattern — 8 child Applications |
| ☸️ **Orchestration** | Kubernetes + Kustomize (`base` + `staging` / `prod` overlays) |
| 🗄️ **Data layer** | PostgreSQL and Redis as `StatefulSet`s with persistent volumes |
| 📊 **Autoscaling** | HPA on CPU **and** memory for `vote`, `result`, `worker` (production only) |
| 📈 **Observability** | Prometheus (kube-prometheus-stack) + 4 exporters + a Grafana dashboard-as-code + Alertmanager → Slack |
| 🧪 **Load testing** | k6 Job executed on demand through ArgoCD |
| 💾 **DR** | Nightly `pg_dump` CronJob with 3-day retention + a restore Job |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           DEVELOPER WORKFLOW                              │
│    git push ──► GitHub ──► Webhook ──► Jenkins (vote | result | worker)   │
└───────────────────────────────────┬──────────────────────────────────────┘
                                    │
                     ┌──────────────▼───────────────┐
                     │        JENKINS CI/CD          │
                     │                               │
                     │  🧹 Clean Workspace            │
                     │  📥 Checkout                   │
                     │  🏷️  Set Image Tag             │
                     │  ⚙️  Install Dependencies      │
                     │  🔬 Trivy FS Scan              │
                     │  📊 SonarQube Analysis         │
                     │  🚦 Quality Gate (abort)       │
                     │  🐳 Docker Build               │
                     │  🔬 Trivy Image Scan           │
                     │  📤 Push to Docker Hub         │
                     │  🔄 kustomize edit set image   │
                     │  🔄 git push (GitOps)          │
                     └──────┬─────────────┬──────────┘
                            │             │
                ┌───────────▼──┐    ┌─────▼────────────┐
                │  Docker Hub  │    │   GitHub  (repo)  │
                │  (registry)  │    │  single source    │
                └──────────────┘    └────────┬──────────┘
                                             │  watch
                                ┌────────────▼──────────────┐
                                │           ArgoCD           │
                                │    App-of-Apps (root)      │
                                └──┬──────────┬─────────┬────┘
                                   │          │         │
                   ┌───────────────▼─┐  ┌─────▼──────┐  │
                   │  voting-staging │  │ voting-prod│  │
                   │                 │  │            │  │
                   │  vote           │  │  vote      │  │
                   │  result         │  │  result    │  │
                   │  worker         │  │  worker    │  │
                   │  redis          │  │  redis     │  │
                   │  postgres       │  │  postgres  │  │
                   │  pgAdmin        │  │  HPA       │  │
                   │  RedisInsight   │  │  Ingress   │  │
                   │  Ingress        │  │  Backup    │  │
                   └─────────────────┘  │  k6 (job)  │  │
                                        └────────────┘  │
                                                        │
                                   ┌────────────────────▼──────────────┐
                                   │       monitoring namespace         │
                                   │                                    │
                                   │  📈 Prometheus + ServiceMonitors    │
                                   │  🎯 blackbox / redis / postgres     │
                                   │     / local-pvc exporters           │
                                   │  📊 Grafana dashboard (as code)     │
                                   │  🔔 Alertmanager → Slack            │
                                   └────────────────────────────────────┘
```

### Application data flow

```
                ┌──────────┐   votes   ┌───────────┐
   User ───────▶│   Vote   │──────────▶│   Redis   │
                │ (Python/ │  :5000    │  (queue)  │
                │  Flask)  │           └─────┬─────┘
                └──────────┘                 │
                                             ▼
                                       ┌───────────┐
                                       │  Worker   │
                                       │ (.NET 8)  │
                                       └─────┬─────┘
                                             │
                                             ▼
                ┌──────────┐           ┌───────────┐
   User ◀───────│  Result  │◀──────────│ Postgres  │
                │(Node.js) │  :4000    │   (db)    │
                └──────────┘           └───────────┘
```

| Service | Stack | Port | Kubernetes object |
|---------|-------|------|-------------------|
| **vote** | Python / Flask | `5000` | Deployment + Service + ConfigMap |
| **redis** | Redis (AOF enabled) | `6379` | StatefulSet + PVC (1Gi) + Service |
| **worker** | .NET 8 | — | Deployment + ConfigMap + Secret |
| **postgres** | PostgreSQL 13 | `5432` | StatefulSet + PVC (1Gi) + Service + ConfigMap + Secret |
| **result** | Node.js 18 | `4000` | Deployment + Service + ConfigMap + Secret |

`vote` and `result` expose `/health` (used by liveness & readiness probes and by the blackbox probes) and `/metrics` (scraped by Prometheus).

---

## 📁 Project Structure

```
Voting-app-End-to-End-Project/
│
├── Application-Code/
│   ├── vote/                           # Python / Flask front-end
│   ├── result/                         # Node.js front-end
│   ├── worker/                         # .NET 8 background worker
│   └── docker-compose.yaml             # Local dev stack
│
├── Jenkins/
│   ├── Jenkinsfile-vote                # CI/CD pipeline — Python
│   ├── Jenkinsfile-result              # CI/CD pipeline — Node.js
│   ├── Jenkinsfile-worker              # CI/CD pipeline — .NET 8
│   ├── jenkins-python-agent/
│   │   └── Dockerfile                  # Custom Python build agent
│   └── jenkins-dotnet8-agent/
│       └── Dockerfile                  # Custom .NET 8 build agent
│
└── Kubernetes-Manifests-file/
    │
    ├── argocd/
    │   ├── app-of-apps.yaml            # Root Application
    │   └── applications/
    │       ├── staging.yaml            # → overlays/staging
    │       ├── prod.yaml               # → overlays/prod
    │       ├── monitoring.yaml         # → monitoring/
    │       ├── blackbox-exporter.yaml  # Helm chart + probes from repo
    │       ├── redis-exporter.yaml     # Helm chart + values from repo
    │       ├── postgres-exporter.yaml  # Helm chart + sealed secret
    │       ├── pvc-exporter.yaml       # local-pvc-exporter DaemonSet
    │       └── loadtest.yaml           # k6 load generator (manual sync)
    │
    ├── base/                           # Environment-agnostic Kustomize base
    │   ├── kustomization.yaml
    │   ├── postgres/                   # StatefulSet, Service, ConfigMap, PVC
    │   ├── redis/                      # StatefulSet, Service, PVC
    │   ├── vote/                       # Deployment, Service, ConfigMap
    │   ├── worker/                     # Deployment, ConfigMap
    │   └── result/                     # Deployment, Service, ConfigMap
    │
    ├── monitoring/
    │   ├── kustomization.yaml          # prometheus-rules + alertmanager + grafana + ServiceMonitor
    │   ├── prometheus-rules/           # PrometheusRule per component (5 files)
    │   ├── alertmanager/               # AlertmanagerConfig + Slack SealedSecret
    │   ├── grafana/dashboards/         # Dashboard-as-code (ConfigMap)
    │   ├── ServiceMonitor/             # vote + result scraping (both namespaces)
    │   ├── blackbox-exporter/          # Helm values + Probe objects
    │   ├── redis-exporter/             # Helm values (multi-target)
    │   ├── postgres-exporter/          # Helm values + SealedSecret
    │   └── pvc-exporter/               # DaemonSet, RBAC, Service, ServiceMonitor
    │
    └── overlays/
        ├── staging/
        │   ├── kustomization.yaml      # base + secrets + pgadmin + redisinsight + ingress
        │   ├── ingress/                # vote.staging.local / result.staging.local
        │   ├── pgadmin/                # DB inspection UI
        │   ├── redisinsight/           # Redis inspection UI
        │   └── secrets/                # Sealed Secrets (staging)
        │
        └── prod/
            ├── kustomization.yaml      # base + hpa + backup + secrets + ingress
            ├── hpa/                    # HPA for vote, result, worker
            ├── ingress/                # vote.local / result.local
            ├── backup/                 # Nightly pg_dump CronJob + PVC
            ├── restore/                # Disaster-recovery Job (applied manually)
            ├── loadgenerator/          # k6 Job + script ConfigMap
            └── secrets/                # Sealed Secrets (prod)
```

---

## 🔄 CI/CD Pipeline

Each service has its own **declarative Jenkins pipeline** under `Jenkins/`, triggered automatically on `githubPush()`:

```
🧹 Clean Workspace
    │
    ▼
📥 Checkout (GitHub, main)
    │
    ▼
🏷️  Set Image Tag ──────────── latest git tag, else sha-<short-commit>
    │                          (also sets the build display name)
    ▼
⚙️  Install Dependencies ───── pip install -r requirements.txt · npm ci · dotnet restore
    │
    ▼
🔬 Trivy Filesystem Scan ───── vuln + secret scanners (HIGH/CRITICAL), JSON report archived
    │
    ▼
📊 SonarQube Analysis ──────── sonar-scanner / dotnet-sonarscanner
    │
    ▼
🚦 Quality Gate ─────────────── waitForQualityGate abortPipeline: true (10 min timeout)
    │
    ▼
🐳 Docker Build ─────────────── tags: <IMAGE_TAG> + latest, with build labels
    │
    ▼
🔬 Trivy Image Scan ─────────── HIGH+CRITICAL report (soft) · CRITICAL ⇒ hard fail
    │
    ▼
📤 Push to Docker Hub ───────── credentials: Dockerhub · docker logout always
    │
    ▼
🔄 Update Staging ───────────── kustomize edit set image → git push ──► ArgoCD auto-syncs
    │
    ▼
✋ Deploy Production ─────────── gated by the APPLY_PROD build parameter
    │
    ▼
🔄 Update Prod ──────────────── kustomize edit set image → git push ──► ArgoCD sync
```

### Pipelines

| Pipeline | App path | Agent | Dependencies | Sonar project |
|----------|----------|-------|--------------|---------------|
| `Jenkinsfile-vote` | `Application-Code/vote` | `houssemdhahri93/jenkins-python-agent` | `pip install -r requirements.txt` | `voting-vote` |
| `Jenkinsfile-result` | `Application-Code/result` | controller + `node18` tool | `npm ci` | `voting-result` |
| `Jenkinsfile-worker` | `Application-Code/worker` | `houssemdhahri93/jenkins-dotnet8-agent` | `dotnet restore` | `Voting-Worker` |

**Common pipeline options:** `buildDiscarder` (2 builds kept) · `timestamps()` · 60-minute global timeout · `disableConcurrentBuilds()`.

**Build parameter:** `APPLY_PROD` (boolean, default `false`) — the manual gate that promotes an image to production.

### Images produced

| Image | Built from |
|-------|------------|
| `houssemdhahri93/voting-vote` | `Application-Code/vote` |
| `houssemdhahri93/voting-result` | `Application-Code/result` |
| `houssemdhahri93/voting-worker` | `Application-Code/worker` |

> 🔑 **Key design point:** Jenkins never runs `kubectl apply`. It only rewrites the image tag inside the overlay's `kustomization.yaml` and pushes to Git — **ArgoCD is the only component that talks to the cluster**, which keeps Git the single source of truth.

### Security & quality tooling

| Tool | What it does |
|------|--------------|
| **Trivy (fs)** | Scans source code for vulnerabilities **and leaked secrets**; report archived as a build artifact |
| **Trivy (image)** | Full HIGH/CRITICAL JSON report + a second pass that **fails the build on any CRITICAL CVE** |
| **SonarQube** | Static analysis per service, enforced by a blocking quality gate |

---

## 🧱 Custom Jenkins Agents

Both agents are built from the Dockerfiles in `Jenkins/` and published to Docker Hub, so pipelines start with every tool already in place — no per-build installation.

| Agent | Base image | Tooling |
|-------|-----------|---------|
| `jenkins-python-agent` | `python:3.13-slim` | OpenJDK 21, Docker CLI 27.3.1, Trivy 0.72, kubectl 1.34.1, kustomize 5.7.1, SonarScanner CLI 7.2, pytest / pylint / black / flake8 |
| `jenkins-dotnet8-agent` | `mcr.microsoft.com/dotnet/sdk:8.0` | OpenJDK 17, Docker CLI 27.3.1, Trivy 0.72, kubectl 1.34.1, kustomize 5.7.1, `dotnet-sonarscanner` 11.0.0, dedicated `jenkins` user (UID 1000) |

Both agents run with the host Docker socket mounted (Docker-outside-of-Docker) and join the `jenkins-sonarqube` network so they can reach the SonarQube server.

```bash
docker build -t houssemdhahri93/jenkins-python-agent:latest  Jenkins/jenkins-python-agent
docker build -t houssemdhahri93/jenkins-dotnet8-agent:latest Jenkins/jenkins-dotnet8-agent
```

---

## ☸️ Kubernetes & GitOps

This project follows the **App-of-Apps** pattern: a single root Application bootstraps everything else.

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

### Child Applications

| Application | Source | Destination | Sync policy |
|-------------|--------|-------------|-------------|
| `voting-staging` | `overlays/staging` | `voting-staging` | Automated (prune + selfHeal), `CreateNamespace=true` |
| `voting-prod` | `overlays/prod` | `voting-prod` | **Manual**, `CreateNamespace=true`, `ApplyOutOfSyncOnly=true` |
| `monitoring-voting-app` | `monitoring/` | `monitoring` | Automated |
| `monitoring-blackbox-exporter` | Helm chart `prometheus-blackbox-exporter` 11.18.0 + probes from this repo | `monitoring` | Automated |
| `monitoring-redis-exporter` | Helm chart `prometheus-redis-exporter` 6.30.0 + repo values | `monitoring` | Automated |
| `monitoring-postgres-exporter` | Helm chart `prometheus-postgres-exporter` 7.4.0 + repo values | `monitoring` | Automated |
| `pvc-exporter` | `monitoring/pvc-exporter` | `monitoring` | Automated |
| `voting-loadtest` | `overlays/prod/loadgenerator` | `voting-prod` | **Manual** (run on demand) |

The three exporter Applications use ArgoCD **multi-source** Applications: the chart comes from the Prometheus community Helm repo, while its `values.yaml` is referenced from this repo via `$values`.

### Why production is not auto-synced

`voting-prod` has no `automated` block, so promotion always requires an explicit sync. It also declares `ignoreDifferences` on `/spec/replicas` for `vote-deployment`, `result-deployment` and `worker-deployment` — otherwise ArgoCD would fight the HPA and continuously reset the replica count back to the value stored in Git.

### How it works end to end

1. `app-of-apps.yaml` is applied once to the cluster.
2. ArgoCD watches `argocd/applications/` and creates the eight child Applications above.
3. Jenkins rewrites the image tag in the target overlay and pushes to `main`.
4. Staging syncs automatically; `selfHeal: true` also reverts any manual drift back to Git.
5. Production is promoted deliberately — `APPLY_PROD=true` in Jenkins, then a sync in ArgoCD.

```bash
kubectl apply -f Kubernetes-Manifests-file/argocd/app-of-apps.yaml
kubectl get applications -n argocd
```

---

## 🌍 Environments

| | Staging | Production |
|---|---------|------------|
| **Overlay** | `overlays/staging` | `overlays/prod` |
| **Namespace** | `voting-staging` | `voting-prod` |
| **Sync** | Automated on every push | Manual promotion (`APPLY_PROD`) |
| **Extras** | pgAdmin, RedisInsight | HPA, nightly backup, restore Job, k6 load test |
| **Ingress hosts** | `vote.staging.local`, `result.staging.local` | `vote.local`, `result.local` |
| **Replicas** | Fixed (1 per service) | HPA-managed (2 → 10) |

Both ingresses use the **Traefik** ingress class (k3s default). Add the hosts to your `/etc/hosts` pointing at the cluster IP to reach them locally.

---

## 📈 Monitoring Stack

The stack assumes **kube-prometheus-stack** is installed with the Helm release name `monitoring` — every `ServiceMonitor`, `Probe`, `PrometheusRule` and `AlertmanagerConfig` in this repo carries the `release: monitoring` label so the operator picks it up.

### Application metrics

`ServiceMonitor` objects in `monitoring/ServiceMonitor/` scrape `vote` and `result` on `/metrics` every `15s`, across **both** `voting-staging` and `voting-prod` (selected by the `app` label).

### Exporters

| Exporter | Deployment | What it covers |
|----------|-----------|----------------|
| **blackbox-exporter** `v0.28.0` | Helm + `Probe` CRDs | Synthetic HTTP checks on `vote` (`/`) and `result` (`/health`) in both namespaces, every 30s |
| **redis-exporter** `v1.90.0` | Helm, multi-target | Redis in staging **and** prod from one deployment (`/scrape` endpoint) |
| **postgres-exporter** `v0.18.1` | Helm, multi-target + SealedSecret | PostgreSQL in staging **and** prod (connections, transactions, DB size) |
| **local-pvc-exporter** `0.3.1` | DaemonSet + RBAC | Real PVC usage on local-path volumes (`local_pvc_*` metrics) — used for the Postgres storage panel |

### Grafana — dashboard as code

`monitoring/grafana/dashboards/voting-dashboard.yaml` ships a ConfigMap labelled `grafana_dashboard: "1"`, so Grafana's sidecar imports it automatically. The dashboard (`uid: voting-monitoring`) has an **Environment** variable to switch between `voting-staging` and `voting-prod`, and is organised in rows:

| Row | Panels |
|-----|--------|
| 🌐 **Application Overview** | UP/DOWN status for vote, result, worker, Redis and PostgreSQL · container restarts table · containers stuck in a waiting state |
| 📊 **Application Performance** | Requests/sec and error-rate % for vote and result |
| 🖥️ **Frontend — Vote / Result** | CPU and memory usage per pod, plotted against the configured limits |
| ⚙️ **Backend — Worker** | CPU / memory vs limits + CPU throttling % |
| 🗄️ **Redis** | CPU / memory vs limits · connected clients · commands/sec |
| 🗄️ **PostgreSQL** | CPU / memory vs limits · active connections · commits & rollbacks · PVC usage table · database size |
| ⭐ **HPA** | Current / desired / min / max replicas · CPU & memory utilization vs HPA target |
| 🚨 **Alerts** | Count of firing alerts + a table of the active ones |

---

## 🔔 Alerting

`monitoring/prometheus-rules/` holds one `PrometheusRule` per component:

| File | Alerts |
|------|--------|
| `vote-frontend-alerts.yaml` | Down · 5xx · 4xx · slow (>2s) · high CPU · high memory · restarting |
| `result-frontend-alerts.yaml` | Same set, for the result service |
| `worker-alerts.yaml` | No available replicas · high CPU · high memory · restarting |
| `redis-alerts.yaml` | Down · rejected connections · high CPU · high memory · restarting |
| `postgresql-alerts.yaml` | Down · >80% of max connections · high CPU · high memory · restarting |

Two details worth highlighting:

- Every rule uses `label_replace(...)` to derive a consistent **`target_namespace`** label, so a single alert definition covers both staging and prod and stays readable in Slack.
- "Down" alerts are joined against `kube_namespace_status_phase` so they only fire when the target namespace is actually `Active` — no alert storms while an environment is being torn down or rebuilt.

### Alertmanager → Slack

`monitoring/alertmanager/alertmanager-config.yaml` routes everything matching `component =~ vote|result|worker|redis|postgresql` to a Slack receiver:

- Grouped by `alertname`, `component`, `target_namespace`
- `groupWait: 30s` · `groupInterval: 5m` · `repeatInterval: 4h`
- Resolved notifications enabled, with a formatted message (alert, component, namespace, severity, description)
- The webhook URL is stored as a **Sealed Secret** (`slack-webhook`), never committed in plaintext

---

## 📊 Autoscaling (HPA)

| File | Target | Min → Max | Triggers |
|------|--------|-----------|----------|
| `overlays/prod/hpa/hpa-vote.yaml` | `vote-deployment` | 2 → 10 | CPU 70% · Memory 80% |
| `overlays/prod/hpa/hpa-result.yaml` | `result-deployment` | 2 → 10 | CPU 70% · Memory 80% |
| `overlays/prod/hpa/hpa-worker.yaml` | `worker-deployment` | 2 → 10 | CPU 70% · Memory 80% |

HPA runs in **production only** — staging stays at a single replica per service to save resources. Requires the **Metrics Server**.

---

## 🧪 Load Testing (k6)

`overlays/prod/loadgenerator/` contains a k6 script (in a ConfigMap) and a Job that casts random votes and reads the results page for 5 minutes with 10 virtual users by default (`USERS`).

The Job is annotated as an ArgoCD **Sync hook** (`hook-delete-policy: BeforeHookCreation,HookSucceeded`) and is exposed through the manually-synced `voting-loadtest` Application — syncing that app runs a fresh load test, which is the quickest way to watch the HPA panels scale up in Grafana.

```bash
argocd app sync voting-loadtest
kubectl get hpa -n voting-prod -w
```

---

## 💾 Backup & Restore

| Component | Path | Behaviour |
|-----------|------|-----------|
| **Backup** | `overlays/prod/backup/` | `CronJob` at `0 2 * * *` — `pg_dump` piped through `gzip` onto a dedicated 2Gi PVC, with automatic cleanup of dumps older than 3 days |
| **Restore** | `overlays/prod/restore/` | On-demand `Job` that drops and recreates the `public` schema, then restores the archive named in `BACKUP_FILE` |

The restore Job is intentionally **not** referenced by `overlays/prod/kustomization.yaml` — it is a manual disaster-recovery action, not something ArgoCD should apply on its own.

```bash
# adjust BACKUP_FILE in restore/configmap.yaml first
kubectl apply -k Kubernetes-Manifests-file/overlays/prod/restore
```

---

## 🔐 Secrets Management

All secrets are encrypted at rest in Git with **Sealed Secrets** (Bitnami controller) — only the target cluster's controller holds the private key.

| Location | Contents |
|----------|----------|
| `overlays/prod/secrets/` | `postgres-secret`, `result-secret`, `worker-secret` (namespace `voting-prod`) |
| `overlays/staging/secrets/` | The same three secrets, scoped to `voting-staging` |
| `monitoring/alertmanager/` | `slack-webhook` — Alertmanager Slack webhook URL |
| `monitoring/postgres-exporter/` | `postgres-exporter-config` — exporter datasources for both environments |

```bash
kubeseal --format yaml < secret.yaml > sealed-secret.yaml
```

> Sealed Secrets are bound to the cluster that sealed them. If you redeploy this project on your own cluster, you must regenerate every sealed secret in this repository.

---

## ⚙️ Prerequisites

| Tool | Purpose |
|------|---------|
| **Kubernetes** (k3s / kind / any cluster) | Orchestration — Traefik is assumed as the ingress controller |
| **ArgoCD** | GitOps controller |
| **kube-prometheus-stack** (Helm release `monitoring`) | Prometheus, Grafana, Alertmanager + the CRDs used here |
| **Metrics Server** | Required for HPA |
| **Sealed Secrets controller** | Decrypting secrets in-cluster |
| **Jenkins** | CI/CD, with the NodeJS, SonarQube Scanner, Docker Pipeline and Git plugins |
| **SonarQube server** | Quality gate (reachable on the `jenkins-sonarqube` Docker network) |
| **Docker** · **kustomize** · **Trivy** | Build, manifest rendering and scanning (already baked into the custom agents) |

### Jenkins configuration

| Item | Type | Usage |
|------|------|-------|
| `Dockerhub` | Username / password credential | Docker Hub login and push |
| `github-token` | Username / password credential | Checkout and GitOps push |
| `SonarQube-Server` | SonarQube server configuration | `withSonarQubeEnv` |
| `sonarqube-scanner` | Global tool | SonarScanner for the `result` pipeline |
| `node18` | NodeJS global tool | `result` pipeline |

---

## 🚀 Getting Started

### 1. Clone

```bash
git clone https://github.com/HoussemDhahri/Voting-app-End-to-End-Project.git
cd Voting-app-End-to-End-Project
```

### 2. Install ArgoCD

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

### 3. Install the Sealed Secrets controller

```bash
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/latest/download/controller.yaml
```

### 4. Install the monitoring stack

```bash
kubectl create namespace monitoring
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install monitoring prometheus-community/kube-prometheus-stack -n monitoring
```

### 5. Bootstrap everything with App-of-Apps

```bash
kubectl apply -f Kubernetes-Manifests-file/argocd/app-of-apps.yaml
kubectl get applications -n argocd
```

This one command creates staging, production, the monitoring manifests, the four exporters and the load-test Application.

### 6. Render the manifests locally (optional)

```bash
kubectl kustomize Kubernetes-Manifests-file/overlays/staging
kubectl kustomize Kubernetes-Manifests-file/overlays/prod
kubectl kustomize Kubernetes-Manifests-file/monitoring
```

### 7. Trigger a deployment

```bash
git push origin main
# Webhook → Jenkins pipeline runs
# → image pushed to Docker Hub
# → staging overlay updated → ArgoCD auto-syncs
# → re-run with APPLY_PROD=true, then sync voting-prod to promote
```

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