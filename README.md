# AttendSphere ERP ISMS

Professional attendance-first Integrated Student Management System.

## Live Deploy (Recommended — Render, always-on)

Render keeps a Node server running so the link opens instantly for students, faculty, and admin.

1. Push this folder to GitHub
2. Open [Render Dashboard](https://dashboard.render.com) → **New +** → **Web Service**
3. Connect your repo; Render auto-detects `render.yaml`
4. Deploy — your URL will be like: `https://attendsphere-erp-isms.onrender.com`

Health check: `GET /api/health` → `{ "ok": true }`

### Option B — Vercel (static + serverless API)

```bash
npm install
npm run seed
npx vercel --prod
```

**Live URL:** [https://attendsphere-erp-isms.vercel.app](https://attendsphere-erp-isms.vercel.app)

## Local Run

```bash
npm install
npm run seed
npm start
```

Open: `http://127.0.0.1:3000`

## Demo Login

| Role | Enrollment | Password |
|------|------------|----------|
| Admin | ADMIN1 | Pass@123 |
| Faculty | FAC1001 | Pass@123 |
| Student (IT) | IT1001 | Pass@123 |
| Student (ECE) | EC1001 | Pass@123 |
| Student (CSE) | CSE1001 | Pass@123 |

## Features

- Branch-wise enrollment (`IT1001`, `EC1012`, `CSE1001`, `ME1001`, `CV1001`, `MT1001`)
- Month-wise + date-wise attendance with %
- Official marksheet UI with photo + QR (Sem I–IV)
- 340 students with real Indian names
- 5 alumni profiles (unique photos, includes Shweta Tiwari)
- Google quick signup + manual signup/login
- AI assistant **Nova**
