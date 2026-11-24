# Business Rules
## Personal Running Coach

Dokumen ini mendefinisikan aturan domain yang harus konsisten di UI, server services, database constraints, dan background jobs.

## 1. User and runner profile

- BR-001: Setiap akun memiliki satu runner profile utama.
- BR-002: Semua data personal dimiliki oleh `user_id`.
- BR-003: Data yang tidak diketahui harus disimpan sebagai `NULL`; jangan menggantinya dengan nol atau asumsi.
- BR-004: Perubahan baseline harus menyimpan waktu pembaruan dan sumber data bila relevan.
- BR-005: Riwayat cedera/limitasi hanya digunakan sebagai konteks kehati-hatian, bukan untuk diagnosis.

## 2. Goals and plans

- BR-010: User memiliki satu primary goal aktif; secondary goals bersifat opsional.
- BR-011: Satu user hanya boleh memiliki satu training plan berstatus `active` pada satu waktu.
- BR-012: Plan harus melewati status `draft` sebelum `active`.
- BR-013: Plan yang telah diaktifkan tidak dihapus ketika diganti; statusnya diubah dan riwayat dipertahankan.
- BR-014: Plan memiliki tanggal mulai dan opsional tanggal akhir/race date.
- BR-015: Plan tidak boleh diaktifkan jika workout schedule atau parameter wajib belum valid.
- BR-016: Perubahan besar pada target, volume, atau fase harus menghasilkan plan revision atau adjustment record.
- BR-017: User dapat pause, resume, complete, atau cancel plan.
- BR-018: Aktivasi plan baru harus menyelesaikan konflik dengan active plan lama melalui transaksi atomik.

## 3. Workouts and calendar

- BR-020: Planned workout adalah instruksi latihan; actual activity adalah aktivitas yang benar-benar terekam. Keduanya tidak boleh digabung menjadi satu record.
- BR-021: Workout dapat memiliki beberapa steps: warm-up, work interval, recovery, cool-down.
- BR-022: Persisted workout status values are strictly: `planned`, `completed`, `skipped`, `rescheduled`, `modified`.
- BR-023: `missed` is a derived presentation/application state, not a persisted database status. A workout is presented as `missed` (unresolved) when its persisted status is `planned` and its `scheduled_date` is earlier than the current calendar date in the runner's configured `timezone_name` (never compared against UTC blindly). Missed workouts never automatically roll forward to the next day or create double sessions, and must preserve their original `scheduled_date`.
- BR-024: Reschedule harus memeriksa konflik kalender, spacing sesi intensitas tinggi, recovery, dan training load sebelum disimpan.
- BR-025: Satu activity dapat dikaitkan dengan satu planned workout sebagai primary match pada MVP (`workout_activities` dengan constraint unik parsial `is_primary = true`); desain harus memungkinkan matching manual.
- BR-026: Matching otomatis harus menyimpan `match_method` dan `match_confidence` (0-1); user dapat mengganti atau melepas match. Sync berikutnya tidak boleh menimpa match yang berstatus `manual`.
- BR-027: Menghapus match hanya menghapus record `workout_activities` dan tidak menghapus activity maupun workout.
- BR-028: Workout yang dimodifikasi atau dijadwalkan ulang harus mempertahankan jejak perubahan dan menaikkan `training_plans.plan_version`.

## 4. Strava activities

- BR-030: External activity ID unik dalam koneksi/provider yang relevan.
- BR-031: Sync harus idempotent: pengulangan event tidak menciptakan duplikasi.
- BR-032: Update dari Strava memperbarui field provider-owned; field manual lokal tidak boleh tertimpa tanpa aturan eksplisit.
- BR-033: Activity yang dihapus di Strava ditandai `is_deleted_at_provider = true` beserta `deleted_at_provider_at`; histori lokal tidak langsung dihapus tanpa kebijakan retensi. Jika activity tersebut memiliki primary match ke workout berstatus `completed`, sistem melepas atau menandai link tersebut sebagai stale dan mengembalikan status workout ke `planned` (yang kemudian tampil sebagai `missed` bila tanggalnya sudah lewat di timezone runner) sambil mencatat audit log, kecuali jika user secara manual menandai selesai.
- BR-034: Semua jarak disimpan dalam meter dan durasi dalam detik.
- BR-035: Pace dihitung dari distance/time yang valid; jangan menganggap moving time dan elapsed time saling dapat dipertukarkan.
- BR-036: Data streams bersifat opsional, lazy-loaded, dan dapat tidak tersedia.
- BR-037: Token OAuth disimpan terenkripsi pada boundary khusus server (`strava_connection_tokens`) dan tidak pernah dikirim ke client.
- BR-038: Token refresh dilakukan sebelum expiry dengan buffer yang dikonfigurasi (baseline 5 menit).
- BR-039: HTTP 401 menandakan koneksi perlu diperbarui/re-authorized (`reauthorization_required`) jika refresh gagal.
- BR-040: HTTP 429 harus menghormati `Retry-After` bila diberikan.
- BR-041: Pagination dan import harus dibatasi per batch (`per_page=50`) untuk menghindari timeout dan rate limit.
- BR-042: OAuth Strava MVP menggunakan scope `activity:read_all` agar aktivitas publik maupun privat ("Only You") tersinkronisasi, dan akses tersebut harus dijelaskan secara eksplisit pada layar koneksi.

## 5. Analytics and training load

- BR-050: Setiap metrik harus memiliki definisi, unit, periode, dan sumber.
- BR-051: Data tidak lengkap harus ditandai; tidak boleh ditampilkan seolah-olah lengkap.
- BR-052: Average pace lintas aktivitas hanya boleh dibandingkan dengan konteks jenis latihan, terrain, dan kondisi yang relevan.
- BR-053: Training load bukan ukuran tunggal kondisi tubuh dan tidak boleh digunakan sebagai diagnosis.
- BR-054: Acute/chronic load ratio tidak boleh diperlakukan sebagai ambang cedera yang pasti.
- BR-055: PR hanya dihitung dari aktivitas yang memenuhi kriteria validasi jarak dan durasi.
- BR-056: Estimasi race performance harus ditandai sebagai estimasi, dengan tanggal dan metode.

## 6. Recovery and readiness

- BR-060: Recovery check-in bersifat manual pada MVP.
- BR-061: Nilai yang tidak diisi tetap unknown, bukan dianggap normal.
- BR-062: Readiness score, jika kelak digunakan, harus menjelaskan faktor dan keterbatasannya.
- BR-063: Satu check-in per user per tanggal lokal dapat menjadi default; edit tetap dimungkinkan.
- BR-064: User dapat melewati check-in tanpa penalti.
- BR-065: Gejala nyeri berat, memburuk, atau tanda bahaya harus menghasilkan saran menghentikan latihan dan mencari bantuan profesional, bukan diagnosis AI.

## 7. AI coach and approvals

- BR-070: AI menerima konteks yang telah disiapkan server, bukan akses database langsung.
- BR-071: AI tidak boleh menulis SQL atau memanggil mutation database secara langsung.
- BR-072: AI output harus sesuai schema dan divalidasi oleh server.
- BR-073: Proposal perubahan harus memuat alasan, evidence, workout terdampak, perubahan before/after, confidence, dan keterbatasan.
- BR-074: User harus menyetujui proposal sebelum perubahan plan diterapkan.
- BR-075: Reject proposal tidak mengubah plan.
- BR-076: Proposal yang stale harus ditolak atau dihitung ulang jika plan berubah setelah proposal dibuat.
- BR-077: AI tidak boleh mengarang aktivitas, PR, HR, pace, atau recovery data.
- BR-078: AI tidak memberikan diagnosis, resep, atau kepastian bebas cedera.
- BR-079: Semua accepted adjustment menyimpan actor, timestamp, source recommendation, dan before/after snapshot.
- BR-080: AI recommendation dapat memiliki status `pending`, `accepted`, `rejected`, `expired`, `superseded`.

## 8. Privacy and retention

- BR-090: User hanya dapat membaca/mengubah data miliknya sendiri.
- BR-091: Strava disconnection harus mencabut/menonaktifkan token lokal dan menghentikan sync berikutnya.
- BR-092: Penghapusan akun/data harus mencakup data terkait sesuai kebijakan retensi dan kewajiban provider.
- BR-093: Data yang dikirim ke model melalui OpenRouter harus dibatasi pada konteks minimum yang diperlukan; provider/model metadata dicatat tanpa menyimpan secret.
- BR-094: Logs tidak boleh menyimpan access token, refresh token, secret, atau data sensitif yang tidak diperlukan.

## 9. State transitions

### Training plan

`draft → active → paused → active → completed`

Alternatif:
- `draft → cancelled`
- `active → cancelled`
- `paused → cancelled`
- `active → completed`

Terminal statuses: `completed`, `cancelled`. Reopening terminal plan harus melalui explicit clone/revision workflow, bukan mengubah histori.

### AI recommendation

`pending → accepted | rejected | expired | superseded`

### Sync job

`pending → processing → completed | retry_wait → processing`
- Maximum attempts: `5` (`BR-102` untuk detail delay 30/60/120 detik dan backoff).
- Exhausted attempts → `failed` / dead-letter, dengan manual retry oleh user.
- Lease expiry (`lease_expires_at`) mengembalikan job `processing` yang macet ke antrean secara aman.

- BR-095: OpenRouter API key hanya boleh digunakan di server-side runtime dan tidak boleh muncul di client bundle, database biasa, atau log.
- BR-096: Model AI dipilih dari konfigurasi server-side yang telah diuji; perubahan model tidak boleh mengubah domain logic atau melewati validasi output.
- BR-097: AI free-tier rate limit, timeout, atau provider outage harus menghasilkan graceful degradation; tidak boleh menyebabkan perubahan training plan parsial.
- BR-098: Strava webhook hanya memvalidasi event dan membuat job idempotent di `sync_jobs`; pemrosesan berat tidak pernah dijalankan inline di webhook request.
- BR-099: Manual `Sync Now` selalu tersedia untuk initial import, incremental sync, dan retry ketika scheduler tidak berjalan.
- BR-100: Training load membedakan tiga metode kalkulasi secara eksplisit: `srpe` (durasi x RPE user-reported), `hr_trimp_estimate` (estimasi berbasis HR ketika resting HR, max HR, dan avg HR tersedia), dan `duration_estimate` (proksi berbasis durasi). Sistem tidak boleh mencampur atau menganggap ketiganya ekuivalen tanpa label metode, unit, `is_estimated`, `completeness`, dan `calculation_version`.
- BR-101: Setelah Strava activity sync, aplikasi menyediakan input RPE opsional (1-10) tanpa memblokir sinkronisasi; jika RPE diisi belakangan, training load dihitung ulang dengan metode `srpe` dan versi kalkulasi diperbarui.
- BR-102: Retry sync job menggunakan maksimal 5 percobaan dengan delay bertahap 30, 60, dan 120 detik untuk percobaan awal lalu bounded exponential backoff dengan jitter (atau `Retry-After` pada HTTP 429 jika lebih besar).
- BR-103: `ai_recommendations` terikat pada `training_plan_id` dan `based_on_plan_version`, dan memiliki masa berlaku default (7 hari sejak dibuat atau saat `plan_version` berubah, mana yang lebih dulu) sebelum berstatus `expired` atau `superseded`.
