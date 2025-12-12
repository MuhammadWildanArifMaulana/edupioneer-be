-- Safe reseed script: truncates key tables and inserts 3 sample rows each.
-- IMPORTANT: This is destructive. Review and run only on dev/local databases.
-- Usage (psql): \i path/to/seed_3_rows.sql

BEGIN;

-- Truncate tables and reset identities. CASCADE to handle FK dependencies.
TRUNCATE TABLE
  tugas_submit,
  materi_view,
  diskusi_post,
  absensi_detail,
  nilai_mapel,
  pembayaran_spp,
  tugas,
  materi,
  diskusi,
  absensi,
  guru_mapel,
  siswa,
  guru,
  mapel,
  kelas,
  join_requests,
  users,
  roles
RESTART IDENTITY CASCADE;

-- 1) Users (3 rows)
INSERT INTO users (email, password, name, role)
VALUES
  ('admin@seed.local', 'password-hash', 'Admin Seed', 'admin'),
  ('guru1@seed.local', 'password-hash', 'Guru Seed 1', 'guru'),
  ('siswa1@seed.local', 'password-hash', 'Siswa Seed 1', 'siswa');

-- 2) Roles (if table exists and has simple `name` column)
-- Adjust columns if your `roles` table differs.
INSERT INTO roles (name)
VALUES ('admin'), ('guru'), ('siswa')
ON CONFLICT DO NOTHING;

-- 3) Kelas (3 rows)
INSERT INTO kelas (nama, tahun_ajaran, semester)
VALUES ('X A', '2024/2025', 1), ('X B', '2024/2025', 1), ('XI A', '2024/2025', 2);

-- 4) Mapel (3 rows)
INSERT INTO mapel (nama)
VALUES ('Matematika'), ('Bahasa Indonesia'), ('Fisika');

-- 5) Guru (3 rows). For one entry link to the user with role 'guru'
INSERT INTO guru (user_id, nama)
SELECT id, 'Guru Seed 1' FROM users WHERE email = 'guru1@seed.local'
UNION ALL
SELECT gen_random_uuid(), 'Guru Seed 2'
UNION ALL
SELECT gen_random_uuid(), 'Guru Seed 3';

-- 6) Siswa (3 rows). First row linked to the user with role 'siswa'
INSERT INTO siswa (user_id, nama, kelas_id)
SELECT u.id, 'Siswa Seed 1', k.id
FROM users u, kelas k
WHERE u.email = 'siswa1@seed.local' AND k.nama = 'X A'
UNION ALL
SELECT gen_random_uuid(), 'Siswa Seed 2', (SELECT id FROM kelas WHERE nama = 'X B')
UNION ALL
SELECT gen_random_uuid(), 'Siswa Seed 3', (SELECT id FROM kelas WHERE nama = 'XI A');

-- 7) Guru_Mapel (3 rows)
INSERT INTO guru_mapel (guru_id, mapel_id, kelas_id)
SELECT g.id, m.id, k.id
FROM (SELECT id FROM guru LIMIT 1) g,
     (SELECT id FROM mapel LIMIT 1) m,
     (SELECT id FROM kelas LIMIT 1) k
UNION ALL
SELECT g2.id, m2.id, k2.id
FROM (SELECT id FROM guru OFFSET 1 LIMIT 1) g2,
     (SELECT id FROM mapel OFFSET 1 LIMIT 1) m2,
     (SELECT id FROM kelas OFFSET 1 LIMIT 1) k2
UNION ALL
SELECT g3.id, m3.id, k3.id
FROM (SELECT id FROM guru OFFSET 2 LIMIT 1) g3,
     (SELECT id FROM mapel OFFSET 2 LIMIT 1) m3,
     (SELECT id FROM kelas OFFSET 2 LIMIT 1) k3;

-- 8) Materi (3 rows)
INSERT INTO materi (guru_mapel_id, judul, deskripsi, file_url)
SELECT id, 'Materi Seed 1', 'Deskripsi materi seed 1', '/files/materi_seed_1.pdf' FROM guru_mapel LIMIT 1
UNION ALL
SELECT id, 'Materi Seed 2', 'Deskripsi materi seed 2', '/files/materi_seed_2.pdf' FROM guru_mapel OFFSET 1 LIMIT 1
UNION ALL
SELECT id, 'Materi Seed 3', 'Deskripsi materi seed 3', '/files/materi_seed_3.pdf' FROM guru_mapel OFFSET 2 LIMIT 1;

-- 9) Materi_View (3 rows)
INSERT INTO materi_view (materi_id, siswa_id, viewed_at)
SELECT m.id, s.id, CURRENT_TIMESTAMP - INTERVAL '1 day' * (row_number() OVER ())
FROM (SELECT id FROM materi LIMIT 3) m, (SELECT id FROM siswa LIMIT 3) s
LIMIT 3;

-- 10) Tugas (3 rows)
INSERT INTO tugas (guru_mapel_id, kelas_id, judul, deskripsi, deadline)
SELECT gm.id, gm.kelas_id, 'Tugas Seed 1', 'Deskripsi tugas 1', CURRENT_TIMESTAMP + INTERVAL '7 days' FROM guru_mapel gm LIMIT 1
UNION ALL
SELECT gm.id, gm.kelas_id, 'Tugas Seed 2', 'Deskripsi tugas 2', CURRENT_TIMESTAMP + INTERVAL '10 days' FROM guru_mapel gm OFFSET 1 LIMIT 1
UNION ALL
SELECT gm.id, gm.kelas_id, 'Tugas Seed 3', 'Deskripsi tugas 3', CURRENT_TIMESTAMP + INTERVAL '14 days' FROM guru_mapel gm OFFSET 2 LIMIT 1;

-- 11) Tugas_Submit (3 rows)
INSERT INTO tugas_submit (tugas_id, siswa_id, file_url, jawaban, submitted_at)
SELECT t.id, s.id, '/submissions/tugas_' || t.id || '_' || s.id || '.pdf', 'Jawaban contoh', CURRENT_TIMESTAMP - INTERVAL '1 day'
FROM (SELECT id FROM tugas LIMIT 3) t, (SELECT id FROM siswa LIMIT 3) s
LIMIT 3;

-- 12) Absensi (3 rows)
INSERT INTO absensi (guru_mapel_id, kelas_id, tanggal)
SELECT gm.id, gm.kelas_id, CURRENT_DATE - INTERVAL '1 day' * (row_number() OVER ())
FROM guru_mapel gm
LIMIT 3;

-- 13) Absensi_Detail (3 rows)
INSERT INTO absensi_detail (absensi_id, siswa_id, status)
SELECT a.id, s.id, 'hadir'
FROM (SELECT id FROM absensi LIMIT 3) a, (SELECT id FROM siswa LIMIT 3) s
LIMIT 3;

-- 14) Diskusi (3 rows)
INSERT INTO diskusi (guru_mapel_id, kelas_id, judul, deskripsi)
SELECT gm.id, gm.kelas_id, 'Diskusi Seed 1', 'Topik diskusi contoh' FROM guru_mapel gm LIMIT 1
UNION ALL
SELECT gm.id, gm.kelas_id, 'Diskusi Seed 2', 'Topik diskusi contoh 2' FROM guru_mapel gm OFFSET 1 LIMIT 1
UNION ALL
SELECT gm.id, gm.kelas_id, 'Diskusi Seed 3', 'Topik diskusi contoh 3' FROM guru_mapel gm OFFSET 2 LIMIT 1;

-- 15) Diskusi_Post (3 rows)
INSERT INTO diskusi_post (diskusi_id, siswa_id, isi)
SELECT d.id, s.id, 'Komentar contoh pada diskusi' FROM (SELECT id FROM diskusi LIMIT 3) d, (SELECT id FROM siswa LIMIT 3) s
LIMIT 3;

-- 16) Nilai_Mapel (3 rows)
INSERT INTO nilai_mapel (siswa_id, guru_mapel_id, nilai, semester)
SELECT s.id, gm.id, 85.0, 1 FROM (SELECT id FROM siswa LIMIT 3) s, (SELECT id FROM guru_mapel LIMIT 3) gm
LIMIT 3;

-- 17) Pembayaran_SPP (3 rows)
INSERT INTO pembayaran_spp (siswa_id, bulan, tahun, jumlah, metode_pembayaran, tanggal_bayar, status)
SELECT s.id, 1, 2024, 150000, 'transfer', CURRENT_TIMESTAMP - INTERVAL '2 days', 'paid' FROM (SELECT id FROM siswa LIMIT 3) s
LIMIT 3;

-- 18) Join Requests (3 rows sample: all pending)
INSERT INTO join_requests (siswa_id, kelas_id, status, created_at)
SELECT s.id, k.id, 'pending', CURRENT_TIMESTAMP
FROM (SELECT id FROM siswa LIMIT 3) s, (SELECT id FROM kelas LIMIT 1) k
LIMIT 3;

COMMIT;

-- End of reseed script
