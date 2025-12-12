-- Stepwise reseed script (destructive).
-- Creates 3 meaningful rows per domain table and multiple users so FK link correctly.
-- Review before running. Run only on dev/local. Uses temporary tables to capture RETURNING ids.

BEGIN;

DO $$
DECLARE
  tbls text[] := ARRAY[
    'tugas_submit','materi_view','diskusi_post','absensi_detail','nilai_mapel','pembayaran_spp',
    'tugas','materi','diskusi','absensi','guru_mapel','siswa','guru','mapel','kelas','join_requests','users','roles'
  ];
  existing text := '';
BEGIN
  FOR i IN array_lower(tbls,1)..array_upper(tbls,1) LOOP
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = tbls[i]) THEN
      IF existing = '' THEN
        existing := tbls[i];
      ELSE
        existing := existing || ',' || tbls[i];
      END IF;
    END IF;
  END LOOP;
  IF existing != '' THEN
    EXECUTE 'TRUNCATE TABLE ' || existing || ' RESTART IDENTITY CASCADE';
  END IF;
END$$;

-- Create temp helper tables to store generated ids for wiring relationships
CREATE TEMP TABLE tmp_users(email text PRIMARY KEY, id uuid) ON COMMIT DROP;
CREATE TEMP TABLE tmp_kelas(nama text PRIMARY KEY, id uuid) ON COMMIT DROP;
CREATE TEMP TABLE tmp_mapel(nama text PRIMARY KEY, id uuid) ON COMMIT DROP;
CREATE TEMP TABLE tmp_guru(user_id uuid PRIMARY KEY, guru_id uuid) ON COMMIT DROP;
CREATE TEMP TABLE tmp_siswa(user_id uuid PRIMARY KEY, siswa_id uuid, kelas_id uuid) ON COMMIT DROP;
CREATE TEMP TABLE tmp_guru_mapel(gm_id uuid PRIMARY KEY, guru_id uuid, mapel_id uuid, kelas_id uuid) ON COMMIT DROP;
CREATE TEMP TABLE tmp_materi(materi_id uuid PRIMARY KEY, gm_id uuid) ON COMMIT DROP;
CREATE TEMP TABLE tmp_tugas(tugas_id uuid PRIMARY KEY, gm_id uuid, kelas_id uuid) ON COMMIT DROP;

INSERT INTO users (email, password, name, role)
VALUES
  ('admin@seed.local', 'password-hash', 'Admin Seed', 'admin'),
  ('guru1@seed.local', 'password-hash', 'Guru Seed 1', 'guru'),
  ('guru2@seed.local', 'password-hash', 'Guru Seed 2', 'guru'),
  ('guru3@seed.local', 'password-hash', 'Guru Seed 3', 'guru'),
  ('siswa1@seed.local', 'password-hash', 'Siswa Seed 1', 'siswa'),
  ('siswa2@seed.local', 'password-hash', 'Siswa Seed 2', 'siswa'),
  ('siswa3@seed.local', 'password-hash', 'Siswa Seed 3', 'siswa');

-- populate tmp_users from the inserted rows
INSERT INTO tmp_users (email, id)
SELECT email, id FROM users WHERE email IN (
  'admin@seed.local','guru1@seed.local','guru2@seed.local','guru3@seed.local','siswa1@seed.local','siswa2@seed.local','siswa3@seed.local'
);

-- 2) Roles (match schema: `nama`, `deskripsi`)
INSERT INTO roles (nama, deskripsi)
VALUES ('Admin', 'Administrator - Full access'), ('Guru', 'Teacher - Can manage classes and assignments'), ('Siswa', 'Student - Can view and submit assignments')
ON CONFLICT (nama) DO NOTHING;

INSERT INTO kelas (nama, tahun_ajaran, semester)
VALUES ('X A', '2024/2025', 1), ('X B', '2024/2025', 1), ('XI A', '2024/2025', 2);

INSERT INTO tmp_kelas (nama, id)
SELECT nama, id FROM kelas WHERE nama IN ('X A','X B','XI A');

INSERT INTO mapel (nama)
VALUES ('Matematika'), ('Bahasa Indonesia'), ('Fisika');

INSERT INTO tmp_mapel (nama, id)
SELECT nama, id FROM mapel WHERE nama IN ('Matematika','Bahasa Indonesia','Fisika');

INSERT INTO guru (user_id, nama)
SELECT id, 'Guru Seed 1' FROM users WHERE email = 'guru1@seed.local';
INSERT INTO guru (user_id, nama)
SELECT id, 'Guru Seed 2' FROM users WHERE email = 'guru2@seed.local';
INSERT INTO guru (user_id, nama)
SELECT id, 'Guru Seed 3' FROM users WHERE email = 'guru3@seed.local';

-- populate tmp_guru
INSERT INTO tmp_guru (user_id, guru_id)
SELECT g.user_id, g.id FROM guru g JOIN users u ON u.id = g.user_id WHERE u.email IN ('guru1@seed.local','guru2@seed.local','guru3@seed.local');

INSERT INTO siswa (user_id, nama, kelas_id)
SELECT id, 'Siswa Seed 1', (SELECT id FROM tmp_kelas WHERE nama = 'X A') FROM users WHERE email = 'siswa1@seed.local';
INSERT INTO siswa (user_id, nama, kelas_id)
SELECT id, 'Siswa Seed 2', (SELECT id FROM tmp_kelas WHERE nama = 'X B') FROM users WHERE email = 'siswa2@seed.local';
INSERT INTO siswa (user_id, nama, kelas_id)
SELECT id, 'Siswa Seed 3', (SELECT id FROM tmp_kelas WHERE nama = 'XI A') FROM users WHERE email = 'siswa3@seed.local';

-- populate tmp_siswa
INSERT INTO tmp_siswa (user_id, siswa_id, kelas_id)
SELECT s.user_id, s.id, s.kelas_id FROM siswa s JOIN users u ON u.id = s.user_id WHERE u.email IN ('siswa1@seed.local','siswa2@seed.local','siswa3@seed.local');

INSERT INTO guru_mapel (guru_id, mapel_id, kelas_id)
SELECT g.guru_id, m.id, k.id FROM tmp_guru g CROSS JOIN tmp_mapel m CROSS JOIN tmp_kelas k LIMIT 3;

-- populate tmp_guru_mapel
INSERT INTO tmp_guru_mapel (gm_id, guru_id, mapel_id, kelas_id)
SELECT id, guru_id, mapel_id, kelas_id FROM guru_mapel LIMIT 3;

INSERT INTO materi (guru_mapel_id, judul, deskripsi, file_url)
SELECT gm.gm_id, 'Materi Seed 1', 'Deskripsi materi seed 1', '/files/materi_seed_1.pdf' FROM tmp_guru_mapel gm LIMIT 1;
INSERT INTO materi (guru_mapel_id, judul, deskripsi, file_url)
SELECT gm.gm_id, 'Materi Seed 2', 'Deskripsi materi seed 2', '/files/materi_seed_2.pdf' FROM tmp_guru_mapel gm OFFSET 1 LIMIT 1;
INSERT INTO materi (guru_mapel_id, judul, deskripsi, file_url)
SELECT gm.gm_id, 'Materi Seed 3', 'Deskripsi materi seed 3', '/files/materi_seed_3.pdf' FROM tmp_guru_mapel gm OFFSET 2 LIMIT 1;

INSERT INTO tmp_materi (materi_id, gm_id)
SELECT id, guru_mapel_id FROM materi LIMIT 3;

INSERT INTO tugas (guru_mapel_id, kelas_id, judul, deskripsi, deadline)
SELECT gm.gm_id, gm.kelas_id, 'Tugas Seed 1', 'Deskripsi tugas 1', CURRENT_TIMESTAMP + INTERVAL '7 days' FROM tmp_guru_mapel gm LIMIT 1;
INSERT INTO tugas (guru_mapel_id, kelas_id, judul, deskripsi, deadline)
SELECT gm.gm_id, gm.kelas_id, 'Tugas Seed 2', 'Deskripsi tugas 2', CURRENT_TIMESTAMP + INTERVAL '10 days' FROM tmp_guru_mapel gm OFFSET 1 LIMIT 1;
INSERT INTO tugas (guru_mapel_id, kelas_id, judul, deskripsi, deadline)
SELECT gm.gm_id, gm.kelas_id, 'Tugas Seed 3', 'Deskripsi tugas 3', CURRENT_TIMESTAMP + INTERVAL '14 days' FROM tmp_guru_mapel gm OFFSET 2 LIMIT 1;

INSERT INTO tmp_tugas (tugas_id, gm_id, kelas_id)
SELECT id, guru_mapel_id, kelas_id FROM tugas LIMIT 3;

-- 10) Tugas_Submit (3 rows) - student submissions referencing tugas and siswa
INSERT INTO tugas_submit (tugas_id, siswa_id, file_url, jawaban, submitted_at)
SELECT t.tugas_id, s.siswa_id, '/submissions/tugas_' || t.tugas_id || '_' || s.siswa_id || '.pdf', 'Jawaban contoh', CURRENT_TIMESTAMP - INTERVAL '1 day'
FROM tmp_tugas t, tmp_siswa s
LIMIT 3;

INSERT INTO absensi (guru_mapel_id, kelas_id, tanggal)
SELECT gm.gm_id, gm.kelas_id, CURRENT_DATE - (row_number() OVER ())::int
FROM tmp_guru_mapel gm
LIMIT 3;

-- 12) Absensi_Detail (3 rows)
INSERT INTO absensi_detail (absensi_id, siswa_id, status)
SELECT a.id, s.siswa_id, 'hadir'
FROM absensi a, tmp_siswa s
WHERE a.id IS NOT NULL
LIMIT 3;

-- 13) Materi_View (3 rows)
INSERT INTO materi_view (materi_id, siswa_id, viewed_at)
SELECT m.materi_id, s.siswa_id, CURRENT_TIMESTAMP - INTERVAL '1 day'
FROM tmp_materi m, tmp_siswa s
LIMIT 3;

INSERT INTO diskusi (guru_mapel_id, kelas_id, judul, deskripsi)
SELECT gm.gm_id, gm.kelas_id, 'Diskusi Seed 1', 'Topik diskusi contoh' FROM tmp_guru_mapel gm LIMIT 1;
INSERT INTO diskusi (guru_mapel_id, kelas_id, judul, deskripsi)
SELECT gm.gm_id, gm.kelas_id, 'Diskusi Seed 2', 'Topik diskusi contoh 2' FROM tmp_guru_mapel gm OFFSET 1 LIMIT 1;
INSERT INTO diskusi (guru_mapel_id, kelas_id, judul, deskripsi)
SELECT gm.gm_id, gm.kelas_id, 'Diskusi Seed 3', 'Topik diskusi contoh 3' FROM tmp_guru_mapel gm OFFSET 2 LIMIT 1;

-- 15) Diskusi_Post (3 rows)
INSERT INTO diskusi_post (diskusi_id, siswa_id, isi)
SELECT d.id, s.siswa_id, 'Komentar contoh pada diskusi' FROM diskusi d, tmp_siswa s
LIMIT 3;

-- 16) Nilai_Mapel (3 rows)
INSERT INTO nilai_mapel (siswa_id, guru_mapel_id, nilai, semester)
SELECT s.siswa_id, gm.gm_id, 85.0, 1 FROM tmp_siswa s, tmp_guru_mapel gm
LIMIT 3;

-- 17) Pembayaran_SPP (3 rows)
INSERT INTO pembayaran_spp (siswa_id, bulan, tahun, jumlah, metode_pembayaran, tanggal_bayar, status)
SELECT s.siswa_id, 1, 2024, 150000, 'transfer', CURRENT_TIMESTAMP - INTERVAL '2 days', 'paid' FROM tmp_siswa s
LIMIT 3;

-- 18) Join Requests (3 rows sample: pending) - only if table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'join_requests') THEN
    INSERT INTO join_requests (siswa_id, kelas_id, status, created_at)
    SELECT s.siswa_id, (SELECT id FROM tmp_kelas LIMIT 1), 'pending', CURRENT_TIMESTAMP
    FROM tmp_siswa s
    LIMIT 3;
  END IF;
END$$;

COMMIT;

-- End of stepwise reseed
