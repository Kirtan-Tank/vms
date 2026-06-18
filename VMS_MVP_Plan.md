# Visitor Management System
## MVP Product Plan
Web App · FastAPI + React + Supabase  
June 2026 · v1.0 · Internal

---

## 1. Overview

This document outlines the plan to build a focused, web-based Visitor Management System (VMS) MVP. The goal is to validate the core visitor check-in and check-out workflow before investing in advanced features. The system will serve as a digital replacement for paper visitor logbooks at offices, societies, or any premises managed by a guard or receptionist.

The MVP is deliberately narrow in scope: it handles one job well — logging who entered, when, why, and ensuring the host is notified.

---

## 2. Problem Statement

Most premises in India still use a physical paper register at the gate. This creates several problems:

- No real-time visibility into who is currently on-site
- Hosts are not notified when their visitors arrive
- Data is not searchable or auditable after the fact
- No record of check-out times or visit duration
- Easy to forge, skip, or lose entries

Existing solutions like GuestRAR and MyGate solve this for residential societies but are either feature-heavy, require app installs, or are not suited for general-purpose use across offices and mixed-use properties. There is a clear gap for a lightweight, web-first tool that any guard or receptionist can use from a browser on any device.

---

## 3. Target Users

| User | Role | Primary Action |
|---|---|---|
| Guard / Receptionist | Logs all visitor entries and exits on-site | Check-in, check-out, print pass |
| Host | Person the visitor is coming to meet | Receives push notification on arrival |
| Admin | Property owner or manager | Views full logs, manages guard accounts |

---

## 4. MVP Scope

### 4.1 In Scope

The following features will be built in the MVP sprint (2–3 weeks):

| Feature | Description |
|---|---|
| Visitor check-in | Guard fills name, phone, host name, purpose of visit. Webcam captures a photo. |
| Visitor check-out | One-tap check-out from the active visitors list. Logs exit timestamp. |
| Printable visitor pass | Auto-generated pass with name, photo, host, and time. Printed via browser print dialog. |
| Host notification | Web Push notification sent to the host's browser on visitor arrival. |
| Active visitors list | Real-time view of everyone currently inside the premises. |
| Visit history log | Searchable log with date filter. All past visits with in/out times. |
| Guard authentication | Email + password login via Supabase Auth. Role-based access (guard / host / admin). |

### 4.2 Out of Scope (v2)

- QR code-based self check-in by visitor
- Pre-registration / visitor invite links
- Watchlist or ID screening
- Analytics and reporting dashboard
- Access control hardware integration (door locks, turnstiles)
- Multi-property support
- Mobile app (Android / iOS)

---

## 5. Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | React + Vite + TypeScript | Fast iteration, familiar stack, Vercel deploy |
| Styling | Tailwind CSS | Utility-first, responsive by default |
| Backend | FastAPI (Python) | Primary stack, ideal for REST APIs, async support |
| Database | Supabase (PostgreSQL) | Auth + DB + Storage in one, free tier |
| Notifications | Web Push API + Service Workers | Free, native OS notifications, no third-party cost |
| Badge generation | Browser `window.print()` | Zero dependency for MVP, no PDF library required |
| Frontend hosting | Vercel | Free tier, instant deploys from GitHub |
| Backend hosting | Render / Railway | Free tier available, supports FastAPI out of the box |

> **Note:** WATI (WhatsApp API) was considered for host notifications but dropped in favour of Web Push Notifications — free, no per-message cost, and delivers native OS-level alerts similar to WhatsApp even when the browser tab is closed.

---

## 6. Data Model

Three database tables. Intentionally minimal — can be extended in v2.

### users
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | Managed by Supabase Auth |
| email | text | Login credential |
| name | text | Display name |
| role | text | `guard`, `host`, or `admin` |
| property_id | UUID (FK) | Which property this user belongs to |
| push_subscription | jsonb | Browser push subscription object (for host notifications) |
| created_at | timestamp | Auto-set by Supabase |

### visitors
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | Auto-generated |
| name | text | Visitor full name |
| phone | text | Visitor phone number |
| photo_url | text | Stored in Supabase Storage |
| host_id | UUID (FK) | Registered host user |
| host_name | text | Denormalized copy for display |
| purpose | text | Reason for visit |
| checked_in_at | timestamp | Set on check-in |
| checked_out_at | timestamp | Null until check-out |
| badge_number | text | Auto-generated pass ID |
| property_id | UUID (FK) | Which property |
| logged_by | UUID (FK) | Guard who logged the entry |
| created_at | timestamp | Auto-set |

### properties
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | Auto-generated |
| name | text | e.g. RedSoft Tower, Gate 1 |
| address | text | Physical address |
| created_at | timestamp | Auto-set |

---

## 7. Visitor Journey

The end-to-end flow from a visitor arriving to departing should take **under 45 seconds**. This is the primary UX benchmark for the MVP.

1. Visitor arrives at gate or reception
2. Guard opens the check-in screen on any browser (desktop or mobile)
3. Guard fills: visitor name, phone, host, purpose of visit
4. Webcam captures a photo of the visitor (browser `getUserMedia` API)
5. Guard taps "Check in" — visitor record is saved to Supabase
6. Visitor pass renders in a new browser tab — guard prints it
7. System sends a Web Push notification to the host: *"Your visitor [Name] has arrived"*
8. On departure, guard finds visitor in the active list and taps "Check out"

---

## 8. Build Plan

Estimated timeline: **2–3 weeks** for a working, deployable MVP.

| Week | Focus | Deliverables |
|---|---|---|
| Week 1 | Core data flow | Check-in form, save to Supabase, active visitors list, check-out action |
| Week 2 | Notifications + pass | Badge print view, Web Push notification on check-in, photo capture via webcam |
| Week 3 | Auth + polish | Guard/host login (Supabase Auth), visit history with date filter, responsive UI, deploy |

---

## 9. API Endpoints (FastAPI)

| Endpoint | Method | Description |
|---|---|---|
| `POST /visitors/checkin` | POST | Log a new visitor entry, trigger Web Push notification to host |
| `PATCH /visitors/checkout/{id}` | PATCH | Set `checked_out_at` timestamp for visitor |
| `GET /visitors/active` | GET | Return all visitors with no check-out time |
| `GET /visitors/log` | GET | Return paginated visit history with optional date filter |
| `GET /visitors/{id}/badge` | GET | Return badge data for print view |
| `POST /push/subscribe` | POST | Store host's browser push subscription |
| `DELETE /push/subscribe` | DELETE | Remove push subscription on logout |

---

## 10. Web Push Notification Flow

1. Host logs in → app requests notification permission
2. On grant, browser generates a push subscription object
3. Frontend calls `POST /push/subscribe` → stored in `users.push_subscription`
4. On visitor check-in, FastAPI fetches host's subscription and sends push via `pywebpush`
5. Host's OS delivers the notification natively, even with the tab closed

**VAPID keys** are generated once and stored as backend environment variables.

---

## 11. V2 Roadmap

| Feature | Impact |
|---|---|
| QR code-based visitor self check-in | Reduces guard workload |
| Pre-registration: host sends invite link | Visitor pre-fills details before arrival |
| Watchlist screening | Screens against an internal deny-list |
| Analytics | Peak hours, average dwell time, visits per host |
| Multi-property support | One admin account managing multiple gates/offices |
| Evacuation muster report | One-tap export of everyone currently inside |
| Mobile-optimized PWA | No app store required |

---

*Internal planning document · Not for distribution*
