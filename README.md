# 💧 HydroTrack

A minimalist full-stack water intake tracker built to help you build healthy hydration habits.

![NestJS](https://img.shields.io/badge/NestJS-10-ea2845?logo=nestjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-000?logo=next.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)

---

## ✨ Features

- **Quick Logging** — One-tap buttons for common amounts (customizable 1–5 presets)
- **Daily Progress** — Visual progress bar with remaining / consumed stats
- **7-Day Chart** — Interactive ECharts bar/line chart with goal marker line
- **Monthly Calendar** — Fixed-height, color-coded goal calendar with clickable day details
- **Day Reset Time** — Configurable day boundary (e.g., 4 AM for night owls)
- **Timezone Aware** — Auto-detects browser timezone for accurate day calculations
- **Google OAuth** — Sign in with Google alongside email/password auth
- **Change Password** — Update password from settings (email/password accounts)
- **Dark Mode** — Follows system preference via Tailwind CSS
- **Fully Responsive** — Mobile-first design that works on all screen sizes

---

## 🏗 Tech Stack

| Layer         | Technology                                                          |
| ------------- | ------------------------------------------------------------------- |
| **Frontend**  | Next.js 14 (App Router), React 18, Tailwind CSS 3, TanStack Query 5 |
| **Backend**   | NestJS 10, Passport JWT + Google OAuth, class-validator DTOs        |
| **Database**  | MongoDB Atlas with Mongoose 8 ODM                                   |
| **Charts**    | Apache ECharts (tree-shaken, SSR-safe via `next/dynamic`)           |
| **Animation** | Framer Motion 11                                                    |
| **Icons**     | Lucide React                                                        |

---

## 📁 Project Structure

```
water-tracker/
├── backend/                    # NestJS REST API
│   └── src/
│       ├── common/             # Shared utils, interfaces, filters
│       └── modules/
│           ├── auth/           # JWT + Google OAuth strategies & guards
│           ├── user/           # User profile, settings, change password
│           └── water/          # Water logging CRUD & aggregations
│
├── frontend/                   # Next.js 14 App Router
│   └── src/
│       ├── app/                # Pages (dashboard, history, settings, auth)
│       ├── components/         # UI, layout, and water components
│       ├── hooks/              # TanStack Query hooks (auth, user, water)
│       ├── lib/                # Axios client, auth helpers, utils
│       └── types/              # Shared TypeScript interfaces
│
├── PRD.md                      # Product Requirements Document
├── TRD.md                      # Technical Requirements Document
└── future-roadmap.md           # Roadmap for future features
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 1. Clone the repository

```bash
git clone https://github.com/your-username/water-tracker.git
cd water-tracker
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your values:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/hydrotrack?retryWrites=true&w=majority
JWT_SECRET=your-secure-random-secret
JWT_EXPIRATION=7d
PORT=4000
FRONTEND_URL=http://localhost:3000

# Optional — Google OAuth (leave empty to disable)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
```

Start the dev server:

```bash
npm run start:dev        # http://localhost:4000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Start the dev server:

```bash
npm run dev              # http://localhost:3000
```

---

## 📡 API Endpoints

All endpoints are prefixed with `/api`.

### Auth

| Method | Endpoint                | Description                      |
| ------ | ----------------------- | -------------------------------- |
| POST   | `/auth/register`        | Register with email & password   |
| POST   | `/auth/login`           | Login and receive JWT            |
| GET    | `/auth/google`          | Initiate Google OAuth flow       |
| GET    | `/auth/google/callback` | Google OAuth callback (redirect) |

### User _(JWT required)_

| Method | Endpoint         | Description                                  |
| ------ | ---------------- | -------------------------------------------- |
| GET    | `/user/me`       | Get current user profile                     |
| PATCH  | `/user/settings` | Update settings (goal, unit, timezone, etc.) |
| PATCH  | `/user/password` | Change password                              |

### Water _(JWT required)_

| Method | Endpoint                    | Description                     |
| ------ | --------------------------- | ------------------------------- |
| POST   | `/water/log`                | Log water for today             |
| GET    | `/water/today`              | Get today's entries & total     |
| GET    | `/water/history`            | Get last 7 days summary         |
| GET    | `/water/month/:year/:month` | Get full month aggregate        |
| GET    | `/water/day/:date`          | Get entries for a specific date |
| POST   | `/water/log/:date`          | Log water for a specific date   |
| DELETE | `/water/:id`                | Delete a water entry            |

---

## 🌐 Deployment

### Backend → Render

1. Create a new **Web Service** on [Render](https://render.com).
2. Set root directory to `backend`.
3. Build command: `npm install && npm run build`
4. Start command: `npm run start:prod`
5. Add environment variables from `.env.example`.
6. Whitelist Render's outbound IPs in MongoDB Atlas Network Access.

### Frontend → Vercel

1. Import the repository on [Vercel](https://vercel.com).
2. Set root directory to `frontend`.
3. Add `NEXT_PUBLIC_API_URL` env var pointing to your Render backend URL (include `/api`).
4. Deploy.

---

## ⚙️ Google OAuth Setup (Optional)

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth 2.0 Client ID** (Web application).
3. Add authorized redirect URI: `https://your-backend.onrender.com/api/auth/google/callback`
4. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in backend env vars.
5. The app works without Google OAuth — it gracefully skips registration when credentials aren't set.

---

## 📄 License

MIT

---

## 👨‍💻 Author

**Ishan Bagchi** — Built with ❤️ and lots of 💧
