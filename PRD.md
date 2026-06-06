# ILYASS TV — Product Requirements Document

> **Version**: 0.1.0 | **Status**: Active Development | **Last Updated**: June 2026

---

## 1. Overview

**ILYASS TV** is a premium IPTV streaming platform with a Next.js web dashboard for managing content (channels, packages, live events, devices, app notifications) and a public-facing website for app downloads. The companion Android client communicates with this backend via Supabase for real-time data, device tracking, and in-app notifications.

### 1.1 Goals

- Provide a full admin dashboard for IPTV content management
- Deliver a polished public website (EN/AR/FR) for app promotion and downloads
- Enable real-time device monitoring with ban/unban control
- Integrate football/sports live event data from multiple APIs
- Manage in-app notification systems (popup, maintenance, social, update updates)
- Support drag-and-drop ordering of packages and channels

### 1.2 Target Audience

- **Admin Operators**: Manage IPTV content, monitor devices, configure app settings
- **End Users**: Download the Android app, browse features/screenshots, access multi-language content

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js | 16.2.6 |
| UI Library | React | 19.2.4 |
| Language | TypeScript | ^5 (strict) |
| Styling | TailwindCSS | ^4 |
| UI System | shadcn/ui (Nova style) | ^4.8.1 |
| Animation | Framer Motion + GSAP + Lenis | Latest |
| Icons | Lucide React | ^1.16.0 |
| Backend | Supabase (PostgreSQL, Auth, Storage) | — |
| i18n | Custom (next-intl installed but unused) | — |
| Shared Lib | prism-kit (animations, motion components) | ^1.0.0 |

---

## 3. Architecture

### 3.1 Route Structure

```
/ → Redirects to /[locale]
/[locale] → Public homepage (SSG with generateStaticParams)
  ├── /en  → English
  ├── /ar  → Arabic (RTL)
  └── /fr  → French

/admin-login → Supabase email/password auth

/dashboard → Protected admin area
  ├── /                     → Overview (analytics, stats)
  ├── /packages             → Package CRUD
  ├── /channels             → Channel CRUD
  ├── /events               → Live events + API import
  ├── /apps                 → App notification systems
  ├── /devices              → Device sessions + presence
  ├── /iptv-order           → Drag-and-drop reordering
  └── /settings             → Public site content

/api → Server-side API routes (service_role key)
  ├── /packages             → Package CRUD
  ├── /channels             → Channel CRUD
  ├── /live-events          → Event CRUD
  ├── /app-systems          → App system updates
  ├── /device-sessions      → Device list + ban/unban
  ├── /settings             → Settings read/write
  ├── /football             → External match fetching
  └── /football-apis        → Football API config
```

### 3.2 Data Flow

```
[Android App] ──Supabase──→ [Supabase DB + Storage]
      ↑                            ↓
      │              [Next.js API Routes] ← service_role key
      │                      ↓
      │          [Dashboard Pages] ← Auth required
      │                      ↓
      └──── [Public Website] ← No auth
```

---

## 4. Feature Specification

### 4.1 Public Website (`/[locale]`)

| Section | Source | Editable From Dashboard |
|---------|--------|------------------------|
| Navbar | Static + locale config | — |
| Hero | `settings.homepage` (title, subtitle, banner) | ✅ Settings > Homepage |
| Features | `settings.features` (title + description array) | ✅ Settings > Features |
| Screenshots | `settings.app_cards[].screenshots[]` | ✅ Settings > Platform Apps |
| Download | `settings.app_cards[]` (name, version, apkUrl, description, changelog) | ✅ Settings > Platform Apps |
| Footer | `settings.footer` (description, email, social links) | ✅ Settings > Footer |

### 4.2 Dashboard Pages

#### 4.2.1 Overview (`/dashboard`)
- 4 stat cards: Packages, Channels, Events, Devices (animated counters)
- Online Users row: Online/Offline/Banned + device type breakdown
- System Status: Maintenance, Popup, Social Popup, Update toggle indicators
- Widgets: Latest Channels, Latest Activity, Upcoming Events
- Auto-refresh every 15 seconds

#### 4.2.2 Packages (`/dashboard/packages`)
- CRUD with inline create/edit forms
- Search with debounce, pagination
- Active/inactive toggle, sort-order management
- Delete with confirmation dialog
- Duplicate sort-order warning

#### 4.2.3 Channels (`/dashboard/channels`)
- CRUD with inline forms
- Auto-generated `channel_key` from package + channel name
- Multi-server support (jsonb array of `{url, name}`)
- Package association, active toggle, sort order

#### 4.2.4 Live Events (`/dashboard/events`)
- CRUD with modal forms
- League filter (color-coded badges)
- Auto-status: LIVE (green, within 2h window), UPCOMING (cyan), FINISHED (gray)
- Import from Yalla Shoottt or API-Sports
- 27 timezone options

#### 4.2.5 App Systems (`/dashboard/apps`)
- 4 notification types: Popup, Maintenance, Social Popup, Update
- Toggle enable/disable per system
- Maintenance: end-time picker with presets (+1d/+2d/+6h/+12h)
- Update: force update toggle, version fields

#### 4.2.6 Device Sessions (`/dashboard/devices`)
- Full device fingerprinting (brand, model, OS, SDK, screen specs)
- Real-time presence with 10s polling
- Ban/unban actions
- Filters: status, device type, banned, active today

#### 4.2.7 IPTV Ordering (`/dashboard/iptv-order`)
- Accordion package list with drag handles
- Drag-and-drop reorder packages and channels
- Visual feedback (opacity, border highlight)

#### 4.2.8 Settings (`/dashboard/settings`)
- Accordion: Homepage, Platform Apps, Downloader Codes, Footer, Features, App Info
- Auto-save with 1.5s debounce for app cards and codes
- APK upload to Supabase Storage, screenshot management
- Feature cards: add/remove title + description

### 4.3 Authentication

- **Provider**: Supabase Auth (email/password)
- **Flow**: Login at `/admin-login` → session cookie → protected dashboard routes
- **Middleware**: Auth check + locale detection in `proxy.ts`
- **Logout**: Clears session, redirects to `/admin-login`

### 4.4 Internationalization

| Locale | Code | Direction |
|--------|------|-----------|
| English | `en` | LTR |
| Arabic | `ar` | RTL |
| French | `fr` | LTR |

- 79 translation keys per locale in JSON files
- Custom `useTranslations()` hook with dot-notation
- Locale detection: URL path → cookie → Accept-Language header

### 4.5 Football API Integration

| Source | Type | Description |
|--------|------|-------------|
| Yalla Shoottt | Scraper | Scrapes `yallashoottt.online` for live matches |
| API-Sports | REST | `api-sports.io` v3 with league filtering, caching |
| Custom | REST | Configurable URL with `{date}` and `{league}` placeholders |

---

## 5. Database Schema

### Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `packages` | IPTV subscription tiers | id, name, sort_order, is_active |
| `channels` | TV channels per package | id, package_id, channel_key, name, logo, servers (jsonb), sort_order |
| `live_events` | Sports/live events | id, team1/2_name, team1/2_logo, match_time, league, channel_key, sort_order |
| `app_systems` | Android notification configs | id, type (enum), enabled, title, message, button_text, end_time, force_update |
| `device_sessions` | Device registry | id, device_id, device_name, platform, brand, model, screen specs, is_banned |
| `device_presence` | Real-time presence | device_id, is_online, last_seen_at, total_opens |
| `device_presence_status` | Real-time status | device_id, last_seen_at, realtime_online |
| `settings` | Key-value config store | key (text PK), value (jsonb) |
| `football_apis` | External API configs | api_name, api_url, api_type, active |

### Storage Buckets

| Bucket | Visibility | Max Size | Types |
|--------|-----------|----------|-------|
| `apks` | Public | 50MB | APK, ZIP |
| `logos` | Public | 5MB | PNG, JPEG, WebP, SVG |
| `events` | Public | 5MB | PNG, JPEG, WebP |
| `popups` | Public | 5MB | PNG, JPEG, WebP |

---

## 6. Design System

### 6.1 Themes

- **Dark Theme**: Deep blue-black backgrounds (`#06061a`), cyan accents (`#22d3ee`), glass surfaces
- **Light Theme**: Light gray-blue backgrounds (`#f5f7fa`), white surfaces, blue accent (`#2563eb`)

### 6.2 CSS Variable Categories

- Backgrounds: `--bg-primary`, `--bg-secondary`, `--bg-tertiary`
- Surfaces: `--surface`, `--surface-hover`, `--surface-elevated`
- Text: `--text-primary`, `--text-secondary`, `--text-muted`
- Accent: `--accent`, `--accent-gradient`, `--accent-green`, `--accent-cyan`, etc.
- Borders: `--border`, `--border-light`, `--border-accent`
- Glassmorphism: `--glass-bg`, `--glass-border`, `--glass-shadow`
- Shadows: `--shadow-xs` through `--shadow-2xl`, `--shadow-glow-*`

### 6.3 Animation Components

- `AnimatedSection`, `FadeInView`, `GlassCard`, `FloatingElement`, `GradientText`
- `PageTransition`, `StaggerGrid`, `StatCard`, `LoadingScreen`, `AnimatedCard`
- 18 animation variants (`fadeInUp`, `scaleIn`, `staggerContainer`, `cardHover`, etc.)
- Custom easing: `[0.16, 1, 0.3, 1]`

### 6.4 UI Components (20 shadcn/ui)

`avatar`, `badge`, `button`, `card`, `checkbox`, `command`, `dialog`, `dropdown-menu`, `input`, `input-group`, `popover`, `searchable-select`, `select`, `separator`, `sheet`, `sonner`, `switch`, `tabs`, `textarea`, `tooltip`

---

## 7. Non-Functional Requirements

| Requirement | Target |
|------------|--------|
| Responsiveness | Mobile (<768px), Tablet (768-1199px), Desktop (1200px+) |
| Page Load | SSG for public pages, server-rendered for dashboard |
| Real-time | Polling (10-15s intervals for devices/analytics) |
| i18n | 3 languages, RTL support for Arabic |
| Auth | Session-based with middleware protection |
| Storage | 4 buckets with MIME and size restrictions |
| SEO | Meta tags, OpenGraph, per-locale static generation |

---

## 8. Future Roadmap

1. Supabase Edge Functions for real-time WebSocket presence
2. Deployment CI/CD with Vercel
3. Error boundary components for production resilience
4. Football APIs dedicated dashboard management page
5. APK file upload integration with Supabase Storage
6. Maintenance mode auto-expiry logic
7. RBAC for multi-admin support
8. Analytics dashboard with charts and export

---

## 9. Glossary

| Term | Definition |
|------|-----------|
| IPTV | Internet Protocol Television — TV delivered over IP networks |
| Package | Subscription tier containing a set of channels |
| Channel | Individual TV channel with stream server URLs |
| Live Event | Sports match or live broadcast with schedule |
| App System | In-app notification type (popup, maintenance, social, update) |
| Device Session | Record of a connected Android device with full specs |
| APK | Android Package Kit — the installable app file |
| Downloader Code | Alternative app download method via Downloader app |
