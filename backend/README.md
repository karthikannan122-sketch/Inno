# INNOVEXA — Backend Architecture & Database Engine

This directory contains the complete backend layer for INNOVEXA, including the Supabase PostgreSQL schema, Row-Level Security (RLS) policies, database types, seed data, and data access services.

---

## Directory Structure

```text
backend/
├── supabase/
│   └── schema.sql                # Complete Supabase PostgreSQL Schema, Tables, Constraints & RLS
├── types/
│   └── database.ts               # Core database entities, validation stages, and DTOs
├── services/
│   ├── projectService.ts         # Project CRUD, validation score calculation, and versioning
│   ├── reviewService.ts          # Structured review management, conflict checks, and answer aggregation
│   ├── authService.ts            # Authentication, user profile synchronization, and roles
│   ├── aiResearchService.ts      # Multi-solution open-source synthesis & architectural generator
│   └── projectComparisonService.ts # Explainable similarity scoring & competitor differentiation matrix
├── seed/
│   ├── seedData.ts               # Initial curated innovation projects, reviewers, and version histories
│   └── openSourceDirectory.ts    # Open-source technology directory & stack blueprints
├── lib/
│   └── supabase.ts               # Supabase JS client instance and configuration
└── README.md                     # Backend architecture documentation
```

---

## Core Database Tables

1. **`profiles`**: User profiles with reputation scores and metadata.
2. **`projects`**: Innovation proposals with validation status (`idea`, `problem_validation`, `gathering_feedback`, `validated`, `needs_improvement`, `ready_to_launch`).
3. **`project_versions`**: Historical versions (`v1.0`, `v1.1`, `v2.0`) with changes summary and validation progression.
4. **`validation_cycles`**: Continuous iteration cycles comparing validation progress across versions.
5. **`review_questions` & `review_answers`**: Structured validation questionnaires (*Problem Relevance*, *Solution Clarity*, *Usefulness*, *Differentiation*).
6. **`reviews`**: Structured peer reviews with built-in **Conflict-of-Interest Protection** (creators cannot review own projects).
7. **`reviewer_matches`**: Smart matching queue scoring reviewer domain, experience, and interests (0–100%).
8. **`related_projects`**: Multi-dimensional similarity scoring (*Problem %*, *Audience %*, *Domain %*, *Solution %*).
9. **`project_insights`**: AI-synthesized validation insights (*Positive Signals*, *Major Concerns*, *Improvement Opportunities*).
10. **`improvement_suggestions`**: The Creator Decision Center (`suggested`, `applied`, `saved`, `dismissed`).
11. **`innovation_signals`**: Visual validation signal telemetry (5 dimensions) feeding the Innovation Status Ring.

---

## Supabase Deployment

To deploy the schema to your Supabase project:
1. Open your Supabase Dashboard -> **SQL Editor**.
2. Copy the contents of [`supabase/schema.sql`](file:///c:/Users/karthick/OneDrive/Desktop/inno/backend/supabase/schema.sql).
3. Click **Run** to provision all tables, relations, and RLS policies.
