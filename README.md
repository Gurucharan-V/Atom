# Atom

# 🌒 Eclipse Reconciler

> **Autonomous Resolution of Cross-System Transaction Mismatches**  
> *Built for the Project Eclipse Hackathon (Genie X Hub / Genie Hive)*

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🎯 Overview

Financial reconciliation across mismatched systems (invoices, spreadsheets, bank statements, emails, and legacy ERPs) is traditionally manual, error-prone, and time-consuming. 

**Eclipse Reconciler** is a full-stack, autonomous AI agent that ingests multi-source transactional data, resolves discrepancies using fuzzy entity matching and RAG-based context retrieval, enforces safety policy thresholds requiring human approval for high-risk actions, and maintains an immutable, auditable execution trail.

---

## ✨ Key Features & Capabilities

- 📥 **Multi-Source Ingestion**: Ingests invoices (PDF/text), payment records (CSV/XLSX), emails (`.eml`/`.txt`), and ERP endpoints.
- 🔍 **Smart Entity & Transaction Matching**: RapidFuzz-assisted matching across vendor names, reference IDs, dates, and amounts.
- 📚 **RAG Context Retrieval**: Vector/semantic search over supporting emails and internal notes for discrepancy context.
- ⚡ **Autonomous Discrepancy Classification**: Identifies partial payments, duplicate payments, price/quantity variances, tax/forex fee discrepancies, and entity mismatches.
- 🛡️ **Human-in-the-Loop Approval Queue**: Consequential actions (posting ledger entries, payment holds, credit notes) above custom confidence/amount thresholds require explicit human sign-off.
- 📝 **Immutable Audit Trail**: Append-only execution log capturing every agent thought, tool call, evidence reference, and action state.
- 🔁 **Verification & Recovery**: Verifies outcomes post-execution; automatically retries, falls back, or escalates on failure.

---


---

## 🛠️ Tech Stack

- **Backend**: Python 3.11, FastAPI, Pydantic v2, SQLAlchemy, SQLite/PostgreSQL
- **Agent Framework & Matching**: Custom tool-calling orchestrator, RapidFuzz, ChromaDB (or TF-IDF fallback)
- **LLM Layer**: Provider-agnostic client (`backend/app/llm/client.py`) supporting deterministic **MOCK mode** and live provider integrations
- **Frontend**: React, Vite, Tailwind CSS
- **Services**: Mock ERP FastAPI service (`mock_erp/`)
- **Infrastructure**: Docker Compose, `dotenv`

---

## 🚀 Quickstart

### Prerequisites

- [Python 3.11+](https://www.python.org/)
- [Node.js 18+](https://nodejs.org/)
- [Docker & Docker Compose](https://www.docker.com/) (optional, for containerized execution)

---

### Option 1: Running with Docker Compose (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/your-username/eclipse-reconciler.git
cd eclipse-reconciler

# 2. Configure environment variables
cp .env.example .env

# 3. Start services
docker-compose up --build

## 🔄 Agent Execution Lifecycle

