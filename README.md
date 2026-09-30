# FundSphere — Full-Stack Production-Style Crowdfunding Platform

> **Tagline**: *Discover ideas. Support innovation. Make an impact.*  
> **Hero**: *Fund Ideas That Matter.*  
> **Subtitle**: *Discover innovative projects, support creators, and help turn meaningful ideas into reality.*

FundSphere is a full-stack crowdfunding web application built for creators and backers across high-impact verticals including **Technology**, **Health & Medical**, **Agriculture & Food**, **Education**, **Clean Energy**, and **Social Impact**.

---

## 🏆 Key Highlights & Zero Hardcoded Data Guarantee

- **100% Real PostgreSQL Persistence**: Every single campaign, contribution, funding total, category, percentage, deadline calculation, notification, and report metric is queried and computed from live PostgreSQL database records.
- **Zero Fallback / Fake Business Values**: No hardcoded 75% funded bars, no hardcoded supporter counts, no hardcoded platform statistics. When the database is fresh, clean, and empty, proper empty states (`"No campaigns available yet."`, `"You haven't contributed to any campaigns yet."`, `"Not enough data to generate this report."`) are displayed.
- **ACID Database Transactions**: Contribution processing uses `prisma.$transaction` to guarantee atomic contribution logging, target goal evaluation, status updates (`ACTIVE` → `FUNDED`), creator & backer notifications, and rollback on any gateway failure.
- **Automated Deadline & Idempotent Refund Engine**: Background job evaluates expired campaigns. If the target funding goal was not achieved before deadline, the campaign transitions to `FAILED`, and the engine disburses automated refunds with unique cryptographic references (`REF-XXXX-XXXX`). A contribution is guaranteed never to be refunded twice (strict idempotency).
- **AI Innovation & Feasibility Matrix**: Real-time heuristic scoring engine analyzing pitch depth, technical feasibility, societal impact, and budget viability. Generates an Innovation Index (0-100), Risk Classification (`LOW_RISK`, `MODERATE_RISK`, `ELEVATED_RISK`), AI Badges, and Milestone Capital Tranche schedules.
- **Personalized Discovery Engine**: Recommends campaigns based on real user interaction weightings (views, saves, contributions) stored in database relations.

---

## 🛠 Technology Stack

### Frontend
- **Framework**: React 18 with Vite & TypeScript
- **Styling**: Tailwind CSS (Cloud White, Ice Blue, Lavender, Soft Pink, Mint, Light Peach palette)
- **State & Server Cache**: TanStack Query (`@tanstack/react-query`)
- **Icons**: Lucide React
- **Data Visualization**: Recharts (Responsive Area, Bar, and Pie Charts)
- **Routing**: React Router DOM v6

### Backend
- **Runtime & Server**: Node.js v22 & Express.js with TypeScript
- **API Style**: RESTful JSON APIs
- **Database ORM**: Prisma ORM v6
- **Database Engine**: PostgreSQL
- **Security & Auth**: JWT (JSON Web Tokens), bcryptjs password hashing (10 salt rounds)
- **Validation**: Zod schema validation middleware
- **Scheduled Jobs**: Automated campaign deadline checker & idempotent refund executor

---

## 🗄 Database Schema Design

```mermaid
erDiagram
    User ||--o{ Campaign : creates
    User ||--o{ Contribution : contributes
    User ||--o{ Notification : receives
    User ||--o{ CampaignInteraction : interacts
    Category ||--o{ Campaign : categorizes
    Campaign ||--o{ Contribution : receives
    Campaign ||--o{ CampaignUpdate : posts
    Contribution ||--o| Refund : triggers
```

### Core Entities & Relationships

1. **User (`users`)**:
   - `id`: CUID (Primary Key)
   - `name`, `email` (Unique), `passwordHash`, `role` (`USER` / `ADMIN`), `avatar`, `bio`, timestamps.
2. **Category (`categories`)**:
   - `id`: CUID (Primary Key)
   - `name` (Unique), `slug` (Unique), `description`, `icon` (Lucide Key), `isActive`, timestamps.
3. **Campaign (`campaigns`)**:
   - `id`: CUID (Primary Key), `creatorId` (FK User), `categoryId` (FK Category)
   - `title`, `slug` (Unique), `shortDescription`, `description`, `fundingGoal`, `amountRaised`, `deadline`, `status` (`DRAFT`, `PENDING_REVIEW`, `ACTIVE`, `FUNDED`, `SUCCESSFUL`, `FAILED`, `REJECTED`, `CANCELLED`), `coverImage`, `rejectionReason`, timestamps.
4. **Contribution (`contributions`)**:
   - `id`: CUID (Primary Key), `campaignId` (FK Campaign), `contributorId` (FK User)
   - `amount`, `paymentStatus` (`PENDING`, `SUCCESS`, `FAILED`, `REFUNDED`), `transactionReference` (Unique), timestamps.
5. **Refund (`refunds`)**:
   - `id`: CUID (Primary Key), `contributionId` (FK Contribution, Unique)
   - `amount`, `status` (`COMPLETED`), `refundReference` (Unique), `processedAt`.
6. **Notification (`notifications`)**:
   - `id`: CUID (Primary Key), `userId` (FK User), `title`, `message`, `type`, `isRead`, `createdAt`.
7. **CampaignUpdate (`campaign_updates`)**:
   - `id`: CUID (Primary Key), `campaignId` (FK Campaign), `title`, `content`, timestamps.
8. **CampaignInteraction (`campaign_interactions`)**:
   - `id`: CUID (Primary Key), `userId`, `campaignId`, `categoryId`, `interactionType`, `createdAt`.

---

## 📡 API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new user (Full name, email, password, confirm password)
- `POST /api/auth/login` — Login with credentials, returns JWT
- `GET /api/auth/me` — Retrieve current authenticated user profile
- `PUT /api/auth/profile` — Update name, bio, and avatar

### Campaigns (`/api/campaigns`)
- `GET /api/campaigns` — Filter by `search`, `category`, `status`, `minGoal`, `maxGoal`, `sortBy`
- `GET /api/campaigns/recommendations` — Personalized discovery based on user activity
- `GET /api/campaigns/:id` — Fetch campaign details, creator, updates, and recent backers
- `POST /api/campaigns` — Create campaign (supports draft mode)
- `PUT /api/campaigns/:id` — Update campaign
- `DELETE /api/campaigns/:id` — Delete draft campaign
- `POST /api/campaigns/:id/submit` — Submit draft for admin review (`PENDING_REVIEW`)
- `POST /api/campaigns/:id/updates` — Creator posts milestone update
- `GET /api/campaigns/:id/innovation-analysis` — Fetch AI Innovation Intelligence Matrix and risk rating
- `POST /api/campaigns/analyze-draft` — Live AI feasibility and innovation pre-check for campaign drafts

### Categories (`/api/categories`)
- `GET /api/categories` — Fetch all active categories
- `POST /api/categories` — Admin: create category
- `PUT /api/categories/:id` — Admin: edit category
- `DELETE /api/categories/:id` — Admin: delete category

### Contributions & Payments (`/api/contributions`)
- `POST /api/contributions` — Execute ACID contribution transaction with payment simulation
- `GET /api/contributions/my` — Contributor's contribution history
- `GET /api/campaigns/:id/contributions` — Contributions for a specific campaign

### Refunds (`/api/refunds`)
- `GET /api/refunds/my` — Contributor's refund history and transaction references

### Notifications (`/api/notifications`)
- `GET /api/notifications` — Fetch user's dynamic notifications
- `PATCH /api/notifications/:id/read` — Mark single notification as read
- `PATCH /api/notifications/read-all` — Mark all notifications as read

### Admin Portal (`/api/admin`)
- `GET /api/admin/stats` — Platform metrics (users, campaigns, funds raised, refunds)
- `GET /api/admin/campaigns/pending` — Review queue
- `PATCH /api/admin/campaigns/:id/approve` — Approve pending campaign (`ACTIVE`)
- `PATCH /api/admin/campaigns/:id/reject` — Reject with mandatory reason stored in DB
- `GET /api/admin/users` — User registry
- `GET /api/admin/contributions` — Audit ledger of all contributions
- `GET /api/admin/refunds` — Audit log of all refunds
- `POST /api/admin/deadline-check` — Trigger deadline scan & automated refund engine

### Reports (`/api/reports`)
- `GET /api/reports/landing-metrics` — Dynamic stats for hero section
- `GET /api/reports/dashboard-stats` — User's personal dashboard aggregations
- `GET /api/reports/overview` — Administrative analytics overview
- `GET /api/reports/category` — Distribution of capital across sectors
- `GET /api/reports/trends` — Daily contribution & creation trends for Recharts

---

## 📁 Folder Structure

```
SRM/
├── package.json               # Root scripts (server, client, seed, build)
├── .env.example               # Root environment variable documentation
├── server/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                   # Server environment configuration
│   ├── .env.example
│   ├── test-e2e.ts            # Complete 13-suite E2E verification test
│   ├── prisma/
│   │   ├── schema.prisma      # PostgreSQL Prisma schema definition
│   │   └── seed.ts            # Optional development seed script
│   └── src/
│       ├── index.ts           # Express server entry point & job startup
│       ├── config/            # DB client & environment configuration
│       ├── repositories/      # Data access layer (Prisma queries)
│       ├── services/          # Business logic & calculations
│       ├── controllers/       # HTTP request/response handlers
│       ├── middleware/        # Auth, Admin, Validation, Centralized Error
│       ├── validators/        # Zod request body schemas
│       ├── jobs/              # Scheduled deadline checker & refund runner
│       ├── utils/             # JWT, password, reference generator, API response
│       └── routes/            # REST API route definitions
└── client/
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js     # Custom theme colors (Cloud, Ice, Lavender, Mint, etc.)
    ├── tsconfig.json
    ├── index.html
    └── src/
        ├── main.tsx           # Client root with TanStack Query & AuthProvider
        ├── App.tsx            # React Router routing configuration
        ├── index.css          # Tailwind CSS base & utilities
        ├── api/               # Modular fetch API services
        ├── types/             # Shared TypeScript definitions
        ├── contexts/          # AuthContext for session management
        ├── components/        # Reusable UI components (Navbar, Footer, Card, Modal, etc.)
        └── pages/
            ├── LandingPage.tsx
            ├── DiscoverPage.tsx
            ├── CampaignDetailsPage.tsx
            ├── CreateCampaignPage.tsx
            ├── Auth/          # Login & Register
            ├── Dashboard/     # Overview, Contributions, My Campaigns, Notifications, Profile
            └── Admin/         # Overview, Review, Campaigns, Categories, Reports, Users, Audits
```

---

## ⚙️ Environment Setup & Installation

### Prerequisites
- **Node.js**: v18+ (v22+ recommended)
- **npm**: v9+
- **PostgreSQL**: Local instance or remote PostgreSQL (e.g. Neon, Supabase, RDS)

### 1. Environment Variables Configuration

In `server/.env`:
```env
PORT=5000
DATABASE_URL="postgresql://username:password@localhost:5432/fundsphere?schema=fundsphere"
DIRECT_URL="postgresql://username:password@localhost:5432/fundsphere?schema=fundsphere"
JWT_SECRET=fundsphere_super_secret_jwt_key_2026_production_hackathon
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### 2. Database Sync & Migrations
```bash
# From server directory or root:
npm run db:push
npm run db:generate
```

### 3. Optional Development Seed Data
> **IMPORTANT NOTE**: Seed data is purely optional development/hackathon demonstration data. The application operates flawlessly with a completely empty database, rendering clean empty states without errors.

To populate demo campaigns and users:
```bash
npm run db:seed
```

---

## 🚀 Running the Application

### Start Backend Server (Port 5000)
```bash
cd server
npm run dev
```

### Start Frontend Client (Port 5173)
```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your web browser.

---

## 🔑 Demo Access Credentials

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@fundsphere.com` | `admin123` | Full Admin Console, Campaign Approvals, Rejections with reason, Taxonomy control, Reports, Audits |
| **Backer / Supporter** | `vikram@investor.com` | `password123` | Contributing to campaigns, viewing contributions, receiving automated refund notices |
| **Creator 1** | `aarav@medtech.io` | `password123` | Creating campaigns, submitting drafts, posting project milestone updates |
| **Creator 2** | `ananya@agrifuture.org` | `password123` | Managing agricultural campaigns, checking live funding analytics |

---

## 🧪 Comprehensive E2E Verification Suite

An automated end-to-end verification script is included in `server/test-e2e.ts`. It executes 13 tests covering:
1. API Health Check
2. User Registration (zero default values)
3. Admin Login & Authorization
4. Dynamic Category Retrieval
5. Campaign Creation & Draft Mode
6. Campaign Submission for Review
7. Admin Approval Workflow
8. ACID Contribution Database Transaction with reference generation
9. Target Goal Achievement (`ACTIVE` → `FUNDED`)
10. Campaign Expiration Detection & Automated Refund Record Creation
11. Refund Idempotency (preventing duplicate refunds)
12. Notification Generation with real campaign and refund amounts
13. Admin Analytics Aggregation

To run the verification suite:
```bash
cd server
npx tsx test-e2e.ts
```

---

## 🎯 Hackathon Demonstration Walkthrough

1. **Empty State or Seeded Mode**:
   - Open [http://localhost:5173](http://localhost:5173). Notice the live platform stats bar calculating real numbers from PostgreSQL.
2. **Discover & Dynamic Filters**:
   - Navigate to `/discover`. Filter by categories (Agriculture, Health, Technology) or search by title. Notice category tags are loaded from backend APIs.
3. **Make a Contribution**:
   - Click on an active campaign (e.g. *NanoPulse: Ultra-Low-Cost ECG*).
   - Click **Fund Campaign**.
   - Notice the contribution field is initially blank (zero hardcoded defaults).
   - Enter ₹500 or select a quick shortcut, and click **Confirm Contribution**.
   - Observe live funding percentage update immediately from the database transaction.
4. **Creator Milestone Updates**:
   - Log in as the creator (`aarav@medtech.io` / `password123`), open the campaign, and click **Post Update** to publish a new milestone.
5. **Admin Campaign Review Queue**:
   - Log in as `admin@fundsphere.com` / `admin123` and visit `/admin/review`.
   - Inspect the pending campaign (*AuraSound*).
   - Click **Approve** to make it `ACTIVE`, or **Reject** with a custom reason.
6. **Automated Refund Demonstration**:
   - Check the expired failed campaign (*HydroMesh*).
   - Visit `/dashboard/contributions` or `/admin/refunds`.
   - Notice how all contributions have status `REFUNDED` with generated references (`REF-XXXX`), and the supporter received a personalized refund notification.
7. **Interactive Recharts Reports**:
   - Navigate to `/admin/reports` to inspect real-time graphs of contribution volume, category distributions, and campaign lifecycle breakdowns.
