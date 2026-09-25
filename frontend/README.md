# INNOVEXA — Frontend Architecture & UI Layer

This directory outlines the complete frontend UI layer for INNOVEXA, built with React 19, TypeScript, Tailwind CSS, Vite, and Three.js.

---

## Directory Structure

```text
src/ (Frontend Application Layer)
├── components/
│   ├── common/                   # Shared UI primitives (Badges, Buttons, Toasts, Rewards)
│   │   └── PointsRewardToast.tsx # Real-time reputation reward & celebration toast
│   ├── home/
│   │   └── Interactive3DEcosystem.tsx # 3D Interactive Command Sphere & Navigation Hub (Three.js)
│   ├── projects/                 # Innovation Cards, Uniqueness, and Differentiator Matrix
│   ├── research/                 # AI Architecture Lab & Multi-Solution Comparison Matrix
│   ├── reviews/                  # Structured Review Cards & Questionnaires
│   └── resources/                # Resource exploration & blueprints
├── pages/
│   ├── HomePage.tsx              # Telemetry dashboard & 3D ecosystem hub
│   ├── ExplorePage.tsx           # Innovation discovery, filters, and categories
│   ├── ProjectDetailPage.tsx     # Full project view with Validation Signals & Journey Map
│   ├── AIResearchPage.tsx        # Multi-stack synthesis, code generation, and comparison
│   ├── RoadmapPage.tsx           # Execution Gantt roadmap & export engine
│   ├── CommunityPage.tsx         # Discussions & peer consensus
│   ├── LaunchPage.tsx            # New project submission & validation intake
│   ├── ProfilePage.tsx           # Creator reputation & project portfolio
│   ├── SettingsPage.tsx          # Account settings & preferences
│   └── NotFoundPage.tsx          # 404 handler
├── layouts/
│   └── AppLayout.tsx             # Shell layout with Sidebar, Header, and Global Toast Mount
├── context/
│   ├── AuthContext.tsx           # Authentication state & reputation score persistence
│   └── ProjectContext.tsx        # Projects, reviews, versions, discussions, and voting state
├── hooks/
│   ├── useAuth.ts                # Auth helper hook
│   ├── useProjects.ts            # Projects data hook
│   └── useDebounce.ts            # Search input debounce hook
├── types/
│   └── database.ts               # Frontend type mappings & UI data contracts
└── index.css                     # Design tokens, typography, and glassmorphism styles
```

---

## Key Features

1. **Innovation Validation Journey**:
   - Visual status ring on cards and detail views (Idea → Problem Validation → Gathering Feedback → Validated → Needs Improvement → Ready to Launch).
   - Multi-stage visual timeline map.
2. **Interactive 3D Navigation Hub**:
   - High-performance Three.js WebGL canvas with continuous mouse-responsive parallax tilt.
   - 360° free orbit drag with inertia, zoom controls, and 1-click raycast navigation portals to `/research`, `/explore`, `/roadmap`, `/community`, `/launch`, and `/insights`.
3. **Multi-Solution Comparison Matrix**:
   - Compares 3 related open-source architectural approaches with feasibility scores, timelines, server costs, pros/cons, and 1-click stack selection.
4. **Reputation & Points System**:
   - Real-time `+5`, `+2`, `+20`, `+50` point increments upon voting, submitting reviews, creating projects, and starting discussions with confetti celebrations.
