# ADR-001: Application Architecture

- Status: Accepted
- Decision: Next.js App Router + TypeScript with Supabase managed backend.
- Context: personal-use responsive web app with Strava sync, analytics, recovery, and AI coaching; free-first deployment target.
- Decision details:
  - Modular monolith in Next.js.
  - Supabase PostgreSQL, Auth, RLS, Storage, and managed background primitives.
  - Next.js Route Handlers for OAuth callback/webhooks.
  - Server Actions as thin mutation entry points.
  - Domain logic in server-side services.
  - No Laravel, separate backend, Redis, or dedicated worker for MVP.
- Consequences:
  - Faster initial delivery and fewer services to operate.
  - Must carefully separate request handling from domain logic.
  - Background processing must respect serverless/runtime and free-tier constraints.
  - Can introduce a dedicated worker/backend if workload outgrows managed primitives.
