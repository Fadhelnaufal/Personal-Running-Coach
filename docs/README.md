# Personal Running Coach — Product & Technical Documentation

Dokumentasi ini menjadi baseline product, business, training methodology, UX, architecture, database, AI, dan design untuk aplikasi **Personal Running Coach**.

## Product direction

Aplikasi web personal untuk pelari recreational tingkat advanced yang ingin mengelola latihan berbasis data aktual, membangun program latihan terstruktur, memahami performa dan recovery, serta memperoleh rekomendasi adaptif dari AI.

**Prinsip penting:** AI membantu menganalisis dan mengusulkan perubahan. Training engine dan aturan deterministik tetap menjadi sumber validasi. Tidak ada perubahan program otomatis tanpa persetujuan pengguna.

## Stack yang ditetapkan

- Next.js App Router + TypeScript strict
- Tailwind CSS + shadcn/ui
- Supabase: PostgreSQL, Auth, Storage, RLS, Edge Functions, Queues/Cron sesuai kebutuhan
- Strava API untuk sumber aktivitas utama
- OpenRouter sebagai AI gateway utama (model dipilih melalui konfigurasi server-side; prioritaskan model gratis yang tersedia)
- Vercel Hobby + Supabase Free sebagai target deployment cloud Rp0/bulan untuk MVP personal, tunduk pada kuota dan ketentuan provider
- Vitest dan Playwright untuk testing

Tidak menggunakan Laravel sebagai asumsi/default. Tidak membutuhkan dedicated backend, Redis, atau worker server terpisah pada MVP.

## Isi dokumentasi

| Dokumen | Tujuan |
|---|---|
| `../AGENTS.md` | Governance, architecture boundaries, security, antislop `during` workflow, quality gates |
| `PRD.md` | Visi, target pengguna, scope, requirement, acceptance criteria |
| `BUSINESS_RULES.md` | Aturan domain dan perilaku sistem (`BR-001`..`BR-103`) |
| `TRAINING_METHODOLOGY.md` | Prinsip penyusunan program, intensitas, default deterministik, training load, recovery |
| `USER_FLOW.md` | Alur onboarding, Strava `activity:read_all`, plan, aktivitas, review, dan AI |
| `ERD.md` | Entitas dan relasi data (`auth.users` + 24 domain/system tables) |
| `DATABASE_SCHEMA.md` | Rancangan tabel, kolom, constraint, index, RLS, isolasi token |
| `SYSTEM_ARCHITECTURE.md` | Arsitektur modular monolith, `sync_jobs` worker, OpenRouter, deployment, security |
| `AI_COACH_SPEC.md` | Peran AI, input/output contract, Q&A schema, guardrail, approval workflow |
| `AI_PROVIDER_STRATEGY.md` | Strategi OpenRouter, model routing, fallback, biaya, privasi |
| `DEPLOYMENT_RUNBOOK.md` | Langkah deploy Vercel Hobby + Supabase Free dan operasional free-cloud |
| `DESIGN.md` | Modern Gradient Athletic - Light First tokens, layout desktop/mobile, anti-generic rules |
| `IMPLEMENTATION_CHECKLIST.md` | Checklist implementasi M0-M9 sesuai `DEC-07` |
| `DOCUMENTATION_AUDIT.md` | Audit baseline dokumentasi dan daftar keputusan (`DEC-01`..`DEC-08`) |
| `DEVELOPMENT_ROADMAP.md` | Roadmap teknis lengkap M0-M9 dengan dependensi dan acceptance criteria |
| `MILESTONE_0_CHANGELOG.md` | Catatan rekonsiliasi Milestone 0, verifikasi provider, dan spike |
| `ADR/` | Architecture Decision Records (ADR-001 sampai ADR-005) |

## Status dan cara menggunakan

Dokumen ini adalah **baseline spesifikasi**, bukan bukti bahwa implementasi sudah ada. Sebelum coding:
1. Review target dan batasan produk.
2. Validasi metodologi latihan dan definisi metrik.
3. Review schema dan kebijakan RLS.
4. Konfirmasi kuota serta ketentuan terbaru Strava, OpenRouter, Vercel Hobby, dan Supabase Free.
5. Pecah requirement menjadi milestone dan issue implementasi.

## Konvensi

- Jarak disimpan dalam meter, durasi dalam detik, berat dalam kilogram, dan waktu sebagai `timestamptz` UTC.
- Data yang tidak tersedia disimpan sebagai `NULL`, bukan angka nol.
- Planned workout dan actual activity adalah dua entitas berbeda.
- Semua data personal harus memiliki ownership yang jelas dan dilindungi RLS.
- Perhitungan metrik harus menyertakan periode, sumber, dan kelengkapan data.
- Angka intensitas/pace harus memiliki sumber atau metode estimasi yang eksplisit.

## Keputusan final (2026-11-24 - Reconciled Milestone 0)

- **Deployment:** **free cloud** - Next.js di Vercel Hobby dan PostgreSQL/Auth/Storage di Supabase Free. Target biaya Rp0/bulan untuk MVP personal, tunduk pada kuota dan kebijakan pause inaktivitas 7 hari.
- **AI:** **OpenRouter primary** - seluruh pemanggilan AI melalui OpenRouter dari server-side adapter (`OPENROUTER_API_KEY`, `OPENROUTER_MODEL`). Prioritaskan model `:free` tanpa fallback diam-diam ke model berbayar.
- **Strava:** **hybrid sync (`activity:read_all`)** - webhook menangkap event ke `sync_jobs` (< 2s); `Sync Now` dan Vercel Hobby 1x/day Cron memproses batch melalui Next.js worker tunggal (`server/jobs/`). Trigger sub-daily (`pg_cron`+`pg_net`) divalidasi pada spike Milestone 3 (Next.js `after()` tidak dianggap durable).
- **Design & Governance:** **Modern Gradient Athletic - Light First** dengan antislop mode **During**; `AGENTS.md` menjadi pedoman pengembangan di root.
- **9Router** tidak menjadi komponen production.

Lihat `ADR/ADR-005-openrouter-ai-gateway.md`, `AI_PROVIDER_STRATEGY.md`, dan `DEPLOYMENT_RUNBOOK.md` untuk detail operasional.
