# Technical Requirements Document (TRD): HydroTrack Full-Stack

**Project:** HydroTrack (MVP v2.0)
**Frontend:** Next.js, Tailwind CSS, TanStack Query
**Backend:** NestJS, MongoDB (Mongoose)
**Date:** February 13, 2026

---

## 1. System Architecture

The application follows a classic **Decoupled Client-Server** architecture. The Frontend communicates with the Backend via a RESTful API, with MongoDB serving as the persistent document store.

### 1.1 Tech Stack

- **Frontend:** Next.js 14+ (App Router), Lucide React (Icons), Framer Motion (Animations).
- **Backend:** NestJS (Node.js framework), Type安全 DTOs with `class-validator`.
- **Database:** MongoDB with Mongoose ODM.
- **State Management:** TanStack Query (React Query) for server-state synchronization.

---

## 2. Database Schema (MongoDB/Mongoose)

### 2.1 User Collection

Stores user-specific settings and targets.

```typescript
{
  _id: ObjectId,
  email: String, // Unique
  dailyGoal: Number, // Default: 2000ml
  unit: String, // 'ml' or 'oz'
  createdAt: Date
}

```

### 2.2 WaterLog Collection

Stores individual intake entries.

```typescript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to User
  amount: Number, // in ml
  date: String, // Format: YYYY-MM-DD (for high-speed indexing)
  timestamp: Date // Exact time of entry
}

```

---

## 3. Backend Implementation (NestJS)

### 3.1 Modules & Structure

- **`AuthModule`**: Handles user identification (JWT).
- **`WaterModule`**: Manages logging and retrieval of water intake.
- **`UserModule`**: Manages profile settings and hydration goals.

### 3.2 API Endpoints (REST)

| Method     | Endpoint         | Description                                          |
| ---------- | ---------------- | ---------------------------------------------------- |
| **POST**   | `/water/log`     | Add a new intake entry (e.g., `{ "amount": 250 }`).  |
| **GET**    | `/water/today`   | Get total consumed today vs user goal.               |
| **GET**    | `/water/history` | Returns aggregated daily totals for the last 7 days. |
| **DELETE** | `/water/:id`     | Undo/Delete a specific entry.                        |
| **PATCH**  | `/user/settings` | Update daily hydration goal.                         |

### 3.3 Core Logic: Aggregation

To calculate the daily total, the backend will use a **MongoDB Aggregation Pipeline**:

1. Match by `userId` and `date`.
2. Group by `date`.
3. `$sum` the `amount` field.

---

## 4. Frontend Integration

### 4.1 Server State Management

Instead of `localStorage`, the app will use **TanStack Query** for:

- **Caching:** Store the "Today's Total" to prevent redundant API calls.
- **Optimistic Updates:** When a user clicks "+250ml", the UI will update the water wave animation _instantly_ before the server confirms the save.

### 4.2 API Client

A centralized `Axios` instance with interceptors to attach Auth headers.

---

## 5. Non-Functional Requirements

### 5.1 Performance

- **Indexing:** Compound index on `{ userId: 1, date: -1 }` in MongoDB to ensure `$sum` operations are O(1) or O(log n).
- **Cold Starts:** Since this is a utility app, the NestJS backend should be deployed on a platform that minimizes cold starts (e.g., Railway, Render, or a dedicated VPS).

### 5.2 Scalability

- The stateless nature of the NestJS controllers allows for horizontal scaling (adding more instances) if traffic grows.

---

## 6. Implementation Roadmap

1. **Phase 1 (Backend Core):** Set up NestJS, connect MongoDB via Mongoose, and create the `WaterLog` schema.
2. **Phase 2 (API Development):** Implement the `POST /log` and `GET /today` endpoints.
3. **Phase 3 (Frontend Connectivity):** Replace LocalStorage logic with API hooks using TanStack Query.
4. **Phase 4 (Analytics):** Build the MongoDB aggregation for the 7-day history chart.
