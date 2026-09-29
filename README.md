<div align="center">

# 🍱 YAMI

**Food delivery platform — academic project**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.119-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](./Docker/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

*Developed as part of the Information Systems course at the University of Zaragoza (2025–2026)*

</div>

---

## 📖 About

**YAMI** is a full-stack food delivery web application where customers can browse restaurants, place orders, and track deliveries, while restaurant managers and administrators manage their operations through dedicated dashboards.

The project was built iteratively over six lab sessions, covering the full software development lifecycle: from requirements and data modelling to a fully containerised deployment.

---

## ✨ Features

| Role | Capabilities |
|------|-------------|
| **Customer** | Browse restaurants & menus, filter by category, add to cart, place orders, rate restaurants, manage profile & subscription |
| **Restaurant** | Manage dishes, view and process incoming orders, view stats |
| **Admin** | Full platform oversight — manage users, restaurants, orders and global statistics |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python 3.11, [FastAPI](https://fastapi.tiangolo.com/), Uvicorn, Pydantic v2 |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL) via `supabase-py` |
| **Auth** | JWT (PyJWT), Passlib / bcrypt |
| **Frontend** | React 18, React Router, CSS Modules |
| **Serving** | Nginx (reverse proxy inside Docker) |
| **Infrastructure** | Docker, Docker Compose |
| **DB Utilities** | DAO / VO pattern, psycopg2, data population scripts |

---

## 📂 Project Structure

```
yami/
├── project/
│   ├── db_utils/          # DAO & VO layer (users, restaurants, dishes, orders…)
│   └── src/
│       ├── Backend/       # FastAPI app — application.py, services.py, model.py
│       └── Frontend/      # React SPA — pages, components, context, CSS
├── Docker/
│   ├── docker-compose.yml # Multi-container setup (backend + frontend + nginx)
│   ├── deploy.sh          # One-command deployment script
│   └── src/               # Dockerfiles for each service
├── SQL/
│   └── DDL.sql            # Database schema (PostgreSQL)
├── .env.example           # Environment variables template
├── requirements.txt       # Python dependencies
└── LICENSE
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+ and npm
- Docker & Docker Compose (for containerised setup)
- A [Supabase](https://supabase.com/) project (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/git874417/Yami.git
cd Yami
```

### 2. Configure environment variables

```bash
cp .env.example .env
# Edit .env and fill in your Supabase URL and service-role key
```

---

## 🐳 Run with Docker (recommended)

```bash
cd Docker
cp ../.env.example .env   # fill in your credentials
bash deploy.sh            # builds images and starts all containers
```

The app will be available at **http://localhost:3000**

---

## 💻 Run locally (without Docker)

#### Backend

```bash
# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn project.src.Backend.application:app --reload
```

API available at **http://127.0.0.1:8000**  
Interactive docs at **http://127.0.0.1:8000/docs**

#### Frontend

```bash
cd project/src/Frontend
npm install
npm start
```

Frontend available at **http://localhost:3000**

---

## 🗄️ Database

The schema is defined in [`SQL/DDL.sql`](./SQL/DDL.sql). Import it into your Supabase project via the SQL editor.

Utility scripts in `project/db_utils/` include:
- `populate_database.py` — seed the DB with sample data
- `simulate_app_behavior.py` — generate realistic usage scenarios
- `clean_test_users.py` / `clean_incomplete_data.py` — maintenance helpers

---

## 👥 Authors

| Name | GitHub |
|------|--------|
| Daniel Blanchard Lobaco | [@dbl04](https://github.com/dbl04) |
| Enrique Cardiel Gascón | [@git874417](https://github.com/git874417) |
| Víctor Sierra Vicén | [@vsier56](https://github.com/vsier56) |

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
