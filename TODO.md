# 📋 HydroTrack — Feature Tracker

**Last Updated:** March 18, 2026

---

## ✅ Completed

- [x] Core water logging (quick-add + custom amount)
- [x] Daily progress ring with consumed / remaining / goal
- [x] 7-day history chart (bar / line toggle, ECharts)
- [x] Monthly goal calendar (fixed-height, clickable days)
- [x] Customizable quick-add amounts (1–5 presets)
- [x] Day reset time (configurable boundary for night owls)
- [x] Timezone-aware date calculations
- [x] Google OAuth login (conditional — works without credentials)
- [x] Change password (email/password accounts)
- [x] Minimal SVG logo + favicon
- [x] Dark mode (system preference)
- [x] Streaks & badges (current / longest streak, milestone badges)
- [x] Weekly / monthly / all-time stats (avg, best day, goal-hit rate)
- [x] Custom entry input (manual ml amount)

---

## 🔜 Up Next

### Quick Wins

- [x] PWA support (installable, offline-capable service worker)
- [ ] **Export Data** — Download history as CSV or JSON from settings
- [ ] **Undo Last Entry** — Toast with undo action after logging water
- [x] **Entry Editing** — Edit an existing log's amount instead of delete + re-add

### Medium Effort

- [ ] **Hydration Reminders (Email)** — Backend cron job (`@nestjs/schedule`) to nudge if no water logged in 3+ hours
- [x] **Beverage Types** — Log what you drank (water, milk, coffee, tea, juice, and custom) with hydration multipliers (e.g., coffee = 0.8×, milk = 0.9×)
- [ ] **Profile Page** — Avatar, display name, account creation date, lifetime total
- [ ] **Monthly PDF Report** — Auto-generated "Hydration Insights" summary with trends

### Larger Features

- [ ] **Push Notifications (FCM)** — Browser push reminders with configurable quiet hours
- [ ] **Real-time Multi-device Sync** — WebSocket support (Socket.io) for instant cross-device updates
- [ ] **Social / Squads** — Hydration challenge groups with friends and leaderboards
- [ ] **Weather-based Suggestions** — OpenWeather API integration for intake recommendations

### Big Bets

- [ ] **React Native Mobile App** — Native app with haptic feedback + home screen widgets
- [ ] **Apple Health / Google Fit Sync** — Bi-directional health data integration
- [ ] **AI Hydration Assistant** — LLM chat for personalized hydration advice
- [ ] **Smartwatch App** — WatchOS / Wear OS companion for one-tap logging
