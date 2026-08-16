# Dawa Track

Dawa Track is a full-stack medication and prescription-management platform. It gives patients, doctors, pharmacists, caregivers, and administrators role-specific tools for managing prescriptions, medication reminders, pharmacy services, and medicine information.

## What it does

- **Patients** can view prescriptions, set medication reminders, check possible drug interactions, find pharmacies, and manage their health profile.
- **Doctors** can create prescriptions, review patients, and view prescription history.
- **Pharmacists** can manage medicine inventory, dispense prescriptions, and maintain dispensing records.
- **Caregivers** can follow linked patient prescription information.
- **Administrators** can manage users and drugs, view analytics, and review audit activity.

## Built with

- **Frontend:** React, TypeScript, Vite, React Router, Zustand, TanStack Query, Leaflet, Recharts, and Lucide icons
- **Backend:** Node.js, Express, JWT authentication, bcrypt password hashing, and sql.js
- **Database:** Local SQLite-compatible database file managed through sql.js

## Project structure

```text
.
├── client/                 # React web application
│   └── src/pages/          # Role-based screens and dashboards
├── server/                 # Express REST API
│   └── src/routes/         # Auth, prescriptions, pharmacy, drugs, reminders, admin
├── package.json            # Commands for running both applications
└── README.md
```

## Getting started

### Prerequisites

- Node.js 18 or newer
- npm

### Install dependencies

From the project root:

```bash
npm run install:all
```

### Run locally

```bash
npm run dev
```

The application will be available at `http://localhost:5173` and the API at `http://localhost:5000`.

You can also start each part separately:

```bash
npm run dev:server
npm run dev:client
```

## API overview

The API base URL is `http://localhost:5000/api`.

| Area | Route prefix |
| --- | --- |
| Authentication | `/auth` |
| Prescriptions | `/prescriptions` |
| Pharmacy | `/pharmacy` |
| Drug catalogue and interactions | `/drugs` |
| Medication reminders | `/reminders` |
| Administration | `/admin` |

Health check: `GET /api/health`

Most protected endpoints expect an authorization header:

```http
Authorization: Bearer <token>
```

## Security notes

- Passwords are hashed with bcrypt before storage.
- Access to protected API routes uses JWTs and role-based authorization.
- Before deploying, set a strong `JWT_SECRET` environment variable. The built-in development fallback must not be used in production.
- The local database file is intentionally excluded from Git because it can contain user data.

## Development status

This repository is a development project. Review authentication, data protection, validation, error handling, infrastructure, and regulatory requirements before using it with real healthcare data or in a production environment.

## License

No license has been specified yet. Add a license before distributing or reusing this project publicly.
