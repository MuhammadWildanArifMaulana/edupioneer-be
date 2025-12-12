-- ========================================
-- DUMMY DATA SEEDING FOR EDUPIONEER
-- 5 entries per table
-- ========================================

-- 1. USERS (Admin, Guru, Siswa)
INSERT INTO users (email, password, name, role) VALUES
  ('admin@edupioneer.com', '$2b$10$rO2DsI8KZkSZJ7K2L9mKJ.WoX1c.Z9c1Z8Y7X6W5V4U3T2S1R0Q', 'Admin Master', 'admin'),
  ('guru.kimia@edupioneer.com', '$2b$10$rO2DsI8KZkSZJ7K2L9mKJ.WoX1c.Z9c1Z8Y7X6W5V4U3T2S1R0Q', 'Rani Wijaya', 'guru'),
  ('guru.matematika@edupioneer.com', '$2b$10$rO2DsI8KZkSZJ7K2L9mKJ.WoX1c.Z9c1Z8Y7X6W5V4U3T2S1R0Q', 'Budi Santoso', 'guru'),
  ('siswa.katarina@edupioneer.com', '$2b$10$rO2DsI8KZkSZJ7K2L9mKJ.WoX1c.Z9c1Z8Y7X6W5V4U3T2S1R0Q', 'Katarina Blue', 'siswa'),
  ('siswa.fahri@edupioneer.com', '$2b$10$rO2DsI8KZkSZJ7K2L9mKJ.WoX1c.Z9c1Z8Y7X6W5V4U3T2S1R0Q', 'Fahri Ramadhan', 'siswa');

-- Get user IDs for reference (in real scenario, use actual UUIDs from insert above)
-- For this script, we'll reference them by email

-- 2. KELAS
INSERT INTO kelas (nama, tahun_ajaran, semester) VALUES
  ('XI MIPA 1', '2024/2025', 1),
  ('XI MIPA 2', '2024/2025', 1),
  ('XI MIPA 3', '2024/2025', 1),
  ('XII MIPA 1', '2024/2025', 1),
  ('XII IPS 1', '2024/2025', 1);

-- 3. MAPEL (Mata Pelajaran)
INSERT INTO mapel (nama) VALUES
  ('Kimia'),
  ('Matematika'),
  ('Bahasa Indonesia'),
  ('Bahasa Inggris'),
  ('Fisika');

-- 4. GURU
INSERT INTO guru (user_id, nama)
SELECT u.id, u.name FROM users u WHERE u.email IN ('guru.kimia@edupioneer.com', 'guru.matematika@edupioneer.com')
UNION ALL
SELECT gen_random_uuid(), 'Siti Nurhaliza' -- Additional guru for completeness
UNION ALL
SELECT gen_random_uuid(), 'Ahmad Hidayat'
UNION ALL
SELECT gen_random_uuid(), 'Dewi Kusuma';

-- 5. SISWA
INSERT INTO siswa (user_id, nama, kelas_id)
SELECT 
  u.id,
  u.name,
  k.id
FROM users u, kelas k
WHERE u.email IN ('siswa.katarina@edupioneer.com', 'siswa.fahri@edupioneer.com')
AND k.nama = 'XI MIPA 1'
UNION ALL
SELECT gen_random_uuid(), 'Lisa Putri', (SELECT id FROM kelas WHERE nama = 'XI MIPA 1')
UNION ALL
SELECT gen_random_uuid(), 'Rizky Saputra', (SELECT id FROM kelas WHERE nama = 'XI MIPA 2')
UNION ALL
SELECT gen_random_uuid(), 'Amelia Wijaya', (SELECT id FROM kelas WHERE nama = 'XI MIPA 2');

-- 6. GURU_MAPEL
INSERT INTO guru_mapel (guru_id, mapel_id, kelas_id)
SELECT 
  g.id,
  m.id,
  k.id
FROM guru g
CROSS JOIN mapel m
CROSS JOIN kelas k
WHERE g.nama IN ('Rani Wijaya', 'Budi Santoso')
AND m.nama IN ('Kimia', 'Matematika')
AND k.nama IN ('XI MIPA 1', 'XI MIPA 2')
LIMIT 5;

-- 7. MATERI
INSERT INTO materi (guru_mapel_id, judul, deskripsi, file_url)
SELECT
  gm.id,
  CASE 
    WHEN row_number() OVER (PARTITION BY gm.id) = 1 THEN 'Struktur Atom dan Sistem Periodik'
    WHEN row_number() OVER (PARTITION BY gm.id) = 2 THEN 'Ikatan Kimia dan Bentuk Molekul'
    WHEN row_number() OVER (PARTITION BY gm.id) = 3 THEN 'Keseimbangan Kimia'
    WHEN row_number() OVER (PARTITION BY gm.id) = 4 THEN 'Asam, Basa, dan Garam'
    ELSE 'Larutan dan Koloid'
  END,
  'Penjelasan lengkap tentang materi pelajaran sesuai dengan kurikulum nasional',
  '/files/materi/materi_' || row_number() OVER (PARTITION BY gm.id) || '.pdf'
FROM guru_mapel gm
LIMIT 5;

-- 8. MATERI_VIEW
INSERT INTO materi_view (materi_id, siswa_id, viewed_at)
SELECT
  m.id,
  s.id,
  CURRENT_TIMESTAMP - INTERVAL '1 day' * floor(random() * 7)
FROM materi m
CROSS JOIN siswa s
WHERE m.id IN (SELECT id FROM materi LIMIT 5)
AND s.id IN (SELECT id FROM siswa LIMIT 5)
LIMIT 5;

-- 9. TUGAS
INSERT INTO tugas (guru_mapel_id, kelas_id, judul, deskripsi, deadline)
SELECT
  gm.id,
  gm.kelas_id,
  CASE
    WHEN row_number() OVER (PARTITION BY gm.id) = 1 THEN 'Menganalisis Struktur Atom'
    WHEN row_number() OVER (PARTITION BY gm.id) = 2 THEN 'Prediksi Bentuk Molekul'
    WHEN row_number() OVER (PARTITION BY gm.id) = 3 THEN 'Hitung Keseimbangan Kimia'
    WHEN row_number() OVER (PARTITION BY gm.id) = 4 THEN 'Identifikasi Asam dan Basa'
    ELSE 'Buat Laporan Koloid'
  END,
  'Kerjakan tugas sesuai dengan instruksi di file yang telah diberikan',
  CURRENT_TIMESTAMP + INTERVAL '7 days'
FROM guru_mapel gm
LIMIT 5;

-- 10. TUGAS_SUBMIT
INSERT INTO tugas_submit (tugas_id, siswa_id, file_url, jawaban, submitted_at)
SELECT
  t.id,
  s.id,
  '/submissions/tugas_' || t.id || '_' || s.id || '.pdf',
  'Jawaban siswa untuk tugas ' || t.judul || ' - Dikerjakan dengan baik dan lengkap',
  CURRENT_TIMESTAMP - INTERVAL '2 days'
FROM tugas t
CROSS JOIN siswa s
WHERE t.id IN (SELECT id FROM tugas LIMIT 5)
AND s.id IN (SELECT id FROM siswa LIMIT 5)
LIMIT 5;

-- 11. ABSENSI
INSERT INTO absensi (guru_mapel_id, kelas_id, tanggal)
SELECT
  gm.id,
  gm.kelas_id,
  CURRENT_DATE - INTERVAL '1 day' * (row_number() OVER (PARTITION BY gm.id) - 1)
FROM guru_mapel gm
LIMIT 5;

-- 12. ABSENSI_DETAIL
INSERT INTO absensi_detail (absensi_id, siswa_id, status)
SELECT
  a.id,
  s.id,
  CASE
    WHEN random() < 0.7 THEN 'hadir'
    WHEN random() < 0.9 THEN 'izin'
    ELSE 'alfa'
  END
FROM absensi a
CROSS JOIN siswa s
WHERE a.id IN (SELECT id FROM absensi LIMIT 5)
AND s.id IN (SELECT id FROM siswa LIMIT 5)
LIMIT 5;

-- 13. DISKUSI
INSERT INTO diskusi (guru_mapel_id, kelas_id, judul, deskripsi)
SELECT
  gm.id,
  gm.kelas_id,
  CASE
    WHEN row_number() OVER (PARTITION BY gm.id) = 1 THEN 'Bagaimana cara menentukan struktur atom?'
    WHEN row_number() OVER (PARTITION BY gm.id) = 2 THEN 'Apa perbedaan ikatan kovalen dan ionik?'
    WHEN row_number() OVER (PARTITION BY gm.id) = 3 THEN 'Bagaimana penerapan keseimbangan kimia dalam industri?'
    WHEN row_number() OVER (PARTITION BY gm.id) = 4 THEN 'Apa itu pH dan bagaimana mengukurnya?'
    ELSE 'Bagaimana cara membedakan koloid dari campuran biasa?'
  END,
  'Diskusi terbuka untuk semua siswa. Silakan berikan pendapat dan pertanyaan Anda.',
  row_number() OVER (PARTITION BY gm.id)
FROM guru_mapel gm
LIMIT 5;

-- 14. DISKUSI_POST
INSERT INTO diskusi_post (diskusi_id, siswa_id, isi)
SELECT
  d.id,
  s.id,
  'Menurut saya, ' || CASE
    WHEN random() < 0.5 THEN 'teori yang dijelaskan sangat menarik dan membantu pemahaman saya.'
    ELSE 'saya masih ada pertanyaan tentang topik ini, bisa dijelaskan lebih detail?'
  END || ' Terima kasih.'
FROM diskusi d
CROSS JOIN siswa s
WHERE d.id IN (SELECT id FROM diskusi LIMIT 5)
AND s.id IN (SELECT id FROM siswa LIMIT 5)
LIMIT 5;

-- 15. NILAI_MAPEL
INSERT INTO nilai_mapel (siswa_id, guru_mapel_id, nilai, semester)
SELECT
  s.id,
  gm.id,
  ROUND((RANDOM() * 50 + 50)::NUMERIC, 2),
  1
FROM siswa s
CROSS JOIN guru_mapel gm
WHERE s.id IN (SELECT id FROM siswa LIMIT 5)
AND gm.id IN (SELECT id FROM guru_mapel LIMIT 5)
LIMIT 5;

-- 16. PEMBAYARAN_SPP
INSERT INTO pembayaran_spp (siswa_id, bulan, tahun, jumlah, metode_pembayaran, tanggal_bayar, status)
SELECT
  s.id,
  CASE row_number() OVER (PARTITION BY s.id)
    WHEN 1 THEN 1
    WHEN 2 THEN 2
    WHEN 3 THEN 3
    WHEN 4 THEN 4
    ELSE 5
  END,
  2024,
  1500000,
  CASE WHEN random() < 0.5 THEN 'transfer' ELSE 'tunai' END,
  CURRENT_TIMESTAMP - INTERVAL '1 day' * floor(random() * 30),
  CASE WHEN random() < 0.8 THEN 'paid' ELSE 'pending' END
FROM siswa s
LIMIT 5;

-- ========================================
-- SUMMARY OF INSERTED DATA
-- ========================================
-- Users: 5 entries (1 admin, 2 guru, 2 siswa)
-- Kelas: 5 entries (class records)
-- Mapel: 5 entries (subjects)
-- Guru: 5 entries (teacher records)
-- Siswa: 5 entries (student records)
-- Guru_Mapel: 5 entries (teacher-subject-class assignments)
-- Materi: 5 entries (learning materials)
-- Materi_View: 5 entries (material view tracking)
-- Tugas: 5 entries (assignments)
-- Tugas_Submit: 5 entries (assignment submissions)
-- Absensi: 5 entries (attendance records)
-- Absensi_Detail: 5 entries (student attendance details)
-- Diskusi: 5 entries (discussion topics)
-- Diskusi_Post: 5 entries (discussion posts)
-- Nilai_Mapel: 5 entries (subject grades)
-- Pembayaran_SPP: 5 entries (school fees payments)
-- ========================================
