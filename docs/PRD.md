# Product Requirements Document (PRD)
## Personal Running Coach

**Status:** Product baseline  
**Platform:** Responsive web application  
**Audience:** Personal use — one primary runner  
**Primary integrations:** Strava, OpenRouter  
**Architecture direction:** Next.js + Supabase; Vercel Hobby + Supabase Free

---

## 1. Product overview

Personal Running Coach adalah aplikasi web yang mengubah data aktivitas lari aktual menjadi program latihan terstruktur, insight performa, pemantauan recovery, dan rekomendasi latihan adaptif.

Aplikasi ditujukan bagi pelari recreational tingkat advanced yang sudah terbiasa berlari dan menggunakan Strava, tetapi membutuhkan sistem yang lebih terarah untuk merencanakan, mengevaluasi, dan menyesuaikan latihan.

### Problem statement

Data lari sering tersebar di aplikasi tracking, sementara rencana latihan berada di tempat terpisah. Pelari dapat melihat jarak dan pace, tetapi belum tentu memahami hubungan antara beban latihan, konsistensi, performa, dan recovery. Program yang statis juga sulit menyesuaikan perubahan kondisi sehari-hari.

### Product promise

Satu tempat untuk:
- Menyusun program latihan berdasarkan tujuan dan baseline aktual.
- Menghubungkan rencana dengan aktivitas Strava yang benar-benar dilakukan.
- Memahami tren performa dan beban latihan.
- Mencatat kondisi recovery.
- Mendapatkan rekomendasi adaptif yang transparan dan tetap berada di bawah kendali pengguna.

## 2. Vision and principles

### Vision

Menjadi personal training workspace yang membantu pelari mengambil keputusan latihan secara lebih terukur, konsisten, dan sadar terhadap kondisi tubuh.

### Product principles

1. **Data-driven:** rekomendasi menggunakan data aktual dan menampilkan keterbatasan data.
2. **Adaptive:** rencana dapat disesuaikan dengan progres, jadwal, dan recovery.
3. **Performance-oriented:** fokus pada perkembangan kemampuan, bukan sekadar streak.
4. **Evidence-informed:** metodologi latihan menggunakan prinsip latihan yang masuk akal dan tidak mengklaim kepastian medis.
5. **Human-controlled:** pengguna menyetujui setiap perubahan rencana.
6. **AI-assisted, not AI-dependent:** kalkulasi penting dan validasi dilakukan oleh domain logic deterministik.
7. **Honest about uncertainty:** data yang tidak tersedia tidak boleh ditebak.

## 3. Target user

### Primary persona

Pelari recreational tingkat advanced yang:
- Memiliki pengalaman latihan lari dan rutin menggunakan Strava.
- Ingin meningkatkan performa, endurance, dan konsistensi.
- Memerlukan struktur program mingguan.
- Ingin mengevaluasi tren pace, volume, intensitas, dan recovery.
- Bersedia mengisi check-in recovery sederhana.

MVP berorientasi personal use, bukan multi-athlete coaching platform. Struktur ownership tetap menggunakan `user_id` agar data aman dan arsitektur tidak mengunci aplikasi menjadi single-user secara teknis.

## 4. Goals and success criteria

### Product goals

- Membantu pengguna memiliki satu training plan aktif yang jelas.
- Mengurangi pekerjaan manual dalam pencatatan aktivitas melalui sinkronisasi Strava.
- Menghubungkan aktivitas aktual dengan workout yang direncanakan.
- Menyajikan tren performa yang dapat dipahami.
- Memberi rekomendasi perubahan latihan yang dapat ditinjau dan disetujui.

### MVP success indicators

- Pengguna berhasil menyelesaikan onboarding dan membuat baseline runner profile.
- Pengguna berhasil menghubungkan Strava dan mengimpor aktivitas tanpa duplikasi.
- Pengguna dapat membuat dan mengaktifkan training plan.
- Aktivitas dapat dipasangkan dengan planned workout, dengan koreksi manual.
- Dashboard menampilkan ringkasan mingguan dan tren dasar dengan indikator kelengkapan data.
- Pengguna dapat melakukan recovery check-in.
- AI dapat menghasilkan weekly review dan proposal penyesuaian terstruktur.
- Tidak ada perubahan training plan oleh AI tanpa approval eksplisit.

Metrik penggunaan dapat ditambahkan setelah ada pemakaian nyata; jangan mengoptimalkan vanity metrics seperti jumlah pesan AI.

## 5. Scope

### MVP — must have

1. Authentication dan private runner workspace.
2. Runner profile dan baseline assessment.
3. Goal management.
4. Training plan creation, preview, activation, pause, completion, cancellation.
5. Weekly training calendar.
6. Workout detail dan workout steps.
7. Strava OAuth connection.
8. Activity sync, historical import, deduplication, update handling.
9. Activity list/detail dan manual workout matching.
10. Basic performance analytics.
11. Manual recovery check-in.
12. AI weekly review dan proposal adjustment melalui OpenRouter (model gratis diprioritaskan).
13. Approval/rejection flow untuk rekomendasi.
14. Audit log untuk perubahan plan dan status integrasi.

### Post-MVP

- Advanced route/GPS visualizations.
- Custom workout builder yang sangat fleksibel.
- Race prediction yang lebih komprehensif.
- HRV/resting HR import otomatis jika sumber tersedia.
- Wearable integrations selain Strava.
- Multi-athlete coach workspace.
- Mobile native app.
- Push notifications.
- Advanced periodization templates.
- Export program dan laporan.

### Out of scope

- Diagnosis medis atau rekomendasi pengobatan.
- Emergency monitoring.
- Automatic plan changes without approval.
- Social feed, follower system, public leaderboard.
- Payment/subscription system pada MVP.
- Penggantian Strava sebagai GPS tracker.

## 6. Core modules

### 6.1 Runner Profile & Assessment

Data:
- Nama tampilan dan preferensi unit.
- Running experience dan riwayat latihan.
- Goal utama dan goal sekunder opsional.
- Personal records (5K, 10K, half marathon, marathon).
- Recent weekly mileage, frequency, longest recent run.
- Easy pace dan threshold pace jika diketahui/terestimasi.
- Heart-rate zones jika tersedia.
- Hari dan waktu yang tersedia untuk latihan.
- Injury history, limitations, dan catatan pengguna.
- Preferensi recovery.

Missing baseline values harus tetap unknown.

### 6.2 Training Plan Engine

Mendukung target 5K, 10K, 21.1K, 42.2K, dan custom goal. Plan dapat memiliki target time, race date, durasi, frekuensi, hari latihan, dan target volume.

Workout mendukung:
- Easy run, long run, recovery run.
- Tempo/threshold.
- Interval/repetition.
- Hill workout.
- Race-pace session.
- Cross-training/rest day (jika direncanakan).
- Warm-up, main set, recovery, cool-down.

### 6.3 Training Calendar

- Weekly dan monthly views.
- Workout detail per hari.
- Status planned, completed, skipped, rescheduled, modified.
- Reschedule manual.
- Missed workout tidak otomatis dipindahkan.
- Perubahan kalender harus menjaga riwayat dan audit.

### 6.4 Strava Activity Management

- OAuth 2.0.
- Initial historical import dan incremental sync.
- Manual sync.
- Webhook-driven update jika tersedia.
- Pagination, rate-limit handling, retry, reconnect flow.
- Deduplication menggunakan external activity ID.
- Activity detail, streams jika tersedia, dan manual matching.

### 6.5 Performance Analytics

MVP:
- Weekly/monthly distance.
- Duration, frequency, elevation gain.
- Longest run.
- Average pace dengan konteks.
- Pace trend untuk aktivitas sebanding.
- Personal records jika data cukup.
- Planned vs completed workout.
- Intensity distribution jika input cukup.
- Training load trend dengan definisi eksplisit.

### 6.6 Recovery & Readiness

Manual check-in:
- Sleep duration dan quality.
- Fatigue.
- Muscle soreness.
- Stress.
- Motivation.
- Resting HR (optional).
- HRV (optional).

Sistem menyajikan tren dan faktor yang memengaruhi rekomendasi, bukan diagnosis.

### 6.7 AI Adaptive Running Coach

Use cases:
- Weekly training review.
- Performance interpretation.
- Recovery insight.
- Goal progress review.
- Proposed plan adjustment.
- Conversational questions about training.

AI output harus terstruktur, divalidasi, dan tidak dapat mengubah database secara langsung.

## 7. Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | User dapat login dan mengakses private workspace | Must |
| FR-02 | User dapat mengisi dan memperbarui runner profile | Must |
| FR-03 | User dapat menetapkan goal utama dan goal sekunder | Must |
| FR-04 | User dapat membuat, preview, dan mengaktifkan training plan | Must |
| FR-05 | Sistem menghasilkan workout terstruktur per fase | Must |
| FR-06 | Sistem menjaga maksimal satu active plan | Must |
| FR-07 | User dapat melihat dan mengelola calendar | Must |
| FR-08 | User dapat menandai, skip, reschedule, atau modify workout | Must |
| FR-09 | User dapat menghubungkan dan memutus Strava | Must |
| FR-10 | Sistem mengimpor dan menyinkronkan aktivitas Strava | Must |
| FR-11 | Sistem mencegah aktivitas duplikat | Must |
| FR-12 | User dapat mengoreksi workout-activity matching | Must |
| FR-13 | Dashboard menampilkan analytics dasar | Must |
| FR-14 | User dapat membuat recovery check-in | Must |
| FR-15 | AI dapat membuat weekly review | Must |
| FR-16 | AI dapat mengusulkan penyesuaian plan | Must |
| FR-17 | User harus menyetujui perubahan plan | Must |
| FR-18 | Sistem menyimpan audit trail perubahan penting | Must |
| FR-19 | User dapat menghapus koneksi Strava dan meminta penghapusan data | Must |
| FR-20 | Sistem memberi status sync dan error yang dapat ditindaklanjuti | Must |

## 8. Non-functional requirements

- **Security:** RLS, secure sessions, server-only secrets, OAuth state validation, ownership checks.
- **Privacy:** data latihan dan recovery bersifat private; minimisasi data yang dikirim ke AI.
- **Reliability:** idempotent sync, retry with backoff, observable job status.
- **Performance:** pagination, query indexes, agregasi sesuai periode, caching yang aman.
- **Accessibility:** semantic HTML, keyboard navigation, visible focus, sufficient contrast.
- **Responsive:** usable on mobile, tablet, desktop.
- **Maintainability:** modular monolith, typed domain boundaries, SQL migrations.
- **Testability:** unit, integration, and end-to-end tests.
- **Data integrity:** foreign keys, unique constraints, UTC timestamps, explicit units.

## 9. Primary user journeys

1. Sign up → onboarding → runner profile → baseline review.
2. Connect Strava → import activities → inspect sync status.
3. Set goal → configure availability → generate plan → review → activate.
4. Open calendar → complete workout → Strava sync → match activity.
5. Review dashboard → inspect trends → submit recovery check-in.
6. Request weekly review → inspect evidence → accept/reject proposed changes.

Detailed flows are in `USER_FLOW.md`.

## 10. Key product rules

- One active training plan per user at a time.
- Planned workout and actual activity are separate records.
- Missing data is `NULL`, not zero.
- Missed workouts are not automatically rolled forward.
- AI proposals require user approval and server-side validation.
- Training plan history must be preserved.
- Activity sync must be idempotent.
- Analytics must indicate incomplete or insufficient data.

See `BUSINESS_RULES.md` for the authoritative rule list.

## 11. Dependencies and risks

| Risk | Impact | Mitigation |
|---|---|---|
| Strava API policy/quota changes | Sync limitations | Isolate adapter, monitor quota, manual import fallback where permitted |
| Free-tier limits change | Unexpected cost or job delays | Keep workloads small, monitor usage, design upgrade path |
| Sparse baseline data | Weak training prescriptions | Ask for inputs, label estimates, conservative defaults |
| AI hallucination / model changes | Unsafe or incorrect advice | Deterministic calculations, Zod validation, evidence requirements, model allowlist, approval |
| Missed webhook events | Stale activities | Periodic reconciliation sync |
| Inaccurate workout matching | Misleading completion stats | Confidence score and manual correction |
| Injury/health risk | User harm | Non-medical disclaimers, conservative guardrails, stop/escalate language |

## 12. Release phases (Aligned with `DEC-07` M0-M9)

- **M0 - Documentation and Project Governance:** Audit, approved decision reconciliation, `AGENTS.md`, provider verification.
- **M1 - Project Foundation and Design System:** Next.js TS strict, Tailwind/shadcn, Supabase SSR, Modern Gradient Athletic tokens, responsive shell.
- **M2 - Authentication and Runner Profile:** Auth, private workspace, RLS, runner profile, baseline assessment, goals.
- **M3 - Strava Integration:** OAuth (`activity:read_all`), isolated token encryption, webhook enqueue, `sync_jobs` worker, `Sync Now`, activity list/detail.
- **M4 - Training Plan Engine:** Deterministic periodized engine, configurable guardrails, preview, atomic activation, versioning.
- **M5 - Training Calendar and Workout-Activity Matching:** Week/month calendar, derived `missed` presentation, reschedule conflict checks, auto/manual matching.
- **M6 - Recovery and Readiness:** Manual daily check-in, trends with explicit gaps, non-medical caution flags.
- **M7 - Performance Analytics:** Dashboard, weekly/monthly volume, comparable pace trends, PRs, `srpe`/`hr_trimp_estimate`/`duration_estimate` load with caveats.
- **M8 - AI Adaptive Running Coach:** OpenRouter server-side adapter, weekly review, Q&A, structured proposal diff, approval workflow, deterministic fallback.
- **M9 - Quality Assurance and Deployment:** Security/RLS/a11y QA, data export/delete, Vercel Hobby + Supabase Free deployment, backup/pause recovery validation.

## 13. Final deployment and AI decisions

- Production target: Vercel Hobby for Next.js and Supabase Free for managed PostgreSQL/Auth/Storage/Edge Functions.
- AI gateway: OpenRouter is the sole production AI entry point for MVP. The selected model is configuration, not hard-coded domain behavior.
- AI cost target: use currently available free model variants where feasible; enforce application-side request budgets, caching, timeouts, and graceful degradation.
- Strava sync: hybrid. Webhooks capture events and enqueue durable work; the user can initiate sync/import and process pending work manually. Scheduled reconciliation is optional and must respect free-tier scheduling limits.
- No VPS, always-on worker, Redis, or production 9Router dependency in MVP.

Free services have quotas, eligibility rules, rate limits, inactivity policies, and provider terms. The product must remain usable when AI or background processing is temporarily unavailable.
