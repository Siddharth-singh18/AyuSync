# AyuSync: Rural Healthcare Orchestration Platform (SIH 2026)

AyuSync is a monorepo platform featuring an offline-first frontline worker app, an explainable AI triage system, and a closed-loop real-time doctor dashboard.

## System Architecture

- **App**: Flutter offline-first application for ASHA workers. Uses SQLite for local persistence and background sync queues.
- **Web**: React.js + TypeScript dashboard for doctors, receiving real-time triage updates via Socket.io.
- **Backend**: Node.js + Express + Socket.io + PostgreSQL (Prisma). Handles closed-loop referrals and event broadcasting.
- **AI Service**: Python FastAPI microservice that processes symptom payloads and returns explainable triage intelligence.

## Closed-Loop Referral Data Flow
1. **ASHA Worker** submits patient data offline in the Flutter app.
2. App syncs data to the **Node.js API** when online.
3. Node API requests triage analysis from the **Python AI Service**.
4. Node API broadcasts the structured referral to the **React Web UI** (Doctor Dashboard).
5. Doctor assigns a counter-task, which is synced back to the ASHA Worker's app.

## Development Setup

### Prerequisites
- Docker & Docker Compose
- Node.js (v18+)
- Python 3.10+
- Flutter SDK (v3.19+)

### Running the Services Locally

We use Docker Compose to spin up the Backend, AI Service, and PostgreSQL database.

```bash
# Start backend, DB, and AI microservice
docker-compose up --build
```

**Starting the Doctor Dashboard (Web)**
```bash
cd web
npm install
npm run dev
```

**Starting the ASHA Worker App (Flutter)**
```bash
cd app
flutter pub get
flutter run
```
