-- Get existing admin UUID
WITH admin_ids AS (
  SELECT id FROM users WHERE email LIKE 'admin%@edupioneer.com' LIMIT 1
),
guru_ids AS (
  SELECT id FROM users WHERE email LIKE 'guru%@edupioneer.com' ORDER BY email LIMIT 5
),
siswa_users AS (
  SELECT id, email FROM users WHERE email LIKE 'siswa%@edupioneer.com' ORDER BY email LIMIT 5
),
siswa_data AS (
  SELECT 
    gen_random_uuid() AS id,
    su.id AS user_id,
    split_part(su.email, '@', 1) AS name
  FROM siswa_users su
)
-- Insert GURU entities (matching existing users)
INSERT INTO guru (id, user_id, nama, created_at, updated_at)
SELECT 
  gen_random_uuid() AS id,
  id,
  'Guru ' || name AS nama,
  NOW(),
  NOW()
FROM (
  SELECT 
    id,
    CASE 
      WHEN email = 'guru1@edupioneer.com' THEN 'Matematika'
      WHEN email = 'guru2@edupioneer.com' THEN 'Bahasa Indonesia'
      WHEN email = 'guru3@edupioneer.com' THEN 'Fisika'
      WHEN email = 'guru4@edupioneer.com' THEN 'Kimia'
      WHEN email = 'guru5@edupioneer.com' THEN 'Biologi'
      ELSE 'Guru'
    END as name
  FROM users 
  WHERE email LIKE 'guru%@edupioneer.com'
  ORDER BY email
) t
WHERE NOT EXISTS (SELECT 1 FROM guru WHERE user_id = t.id)
ON CONFLICT DO NOTHING;

-- Insert SISWA entities (matching existing users)
INSERT INTO siswa (id, user_id, nama, kelas_id, created_at, updated_at)
SELECT 
  gen_random_uuid() AS id,
  u.id,
  u.name,
  (SELECT id FROM kelas ORDER BY random() LIMIT 1),
  NOW(),
  NOW()
FROM users u
WHERE u.email LIKE 'siswa%@edupioneer.com'
AND NOT EXISTS (SELECT 1 FROM siswa WHERE user_id = u.id)
ON CONFLICT DO NOTHING;

-- Now with existing GURU and SISWA, continue with related data
-- Insert GURU_MAPEL (5 entries)
INSERT INTO guru_mapel (id, guru_id, mapel_id, kelas_id, created_at)
SELECT 
  gen_random_uuid(),
  g.id,
  m.id,
  (SELECT id FROM kelas ORDER BY random() LIMIT 1),
  NOW()
FROM guru g
CROSS JOIN mapel m
WHERE g.id IN (SELECT id FROM guru ORDER BY created_at DESC LIMIT 5)
AND m.id IN (SELECT id FROM mapel ORDER BY created_at DESC LIMIT 5)
LIMIT 5
ON CONFLICT DO NOTHING;

-- Insert MATERI (5 entries)
INSERT INTO materi (id, guru_mapel_id, judul, deskripsi, file_url, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  gm.id,
  'Materi ' || ROW_NUMBER() OVER (ORDER BY gm.id),
  'Deskripsi materi pembelajaran ' || ROW_NUMBER() OVER (ORDER BY gm.id),
  'https://example.com/materi' || ROW_NUMBER() OVER (ORDER BY gm.id) || '.pdf',
  NOW(),
  NOW()
FROM guru_mapel gm
LIMIT 5
ON CONFLICT DO NOTHING;

-- Insert MATERI_VIEW (5 entries)
INSERT INTO materi_view (id, materi_id, siswa_id, viewed_at)
SELECT 
  gen_random_uuid(),
  m.id,
  (SELECT id FROM siswa ORDER BY random() LIMIT 1),
  NOW()
FROM materi m
LIMIT 5
ON CONFLICT DO NOTHING;

-- Insert TUGAS (5 entries)
INSERT INTO tugas (id, guru_mapel_id, kelas_id, judul, deskripsi, deadline, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  gm.id,
  gm.kelas_id,
  'Tugas ' || ROW_NUMBER() OVER (ORDER BY gm.id),
  'Kerjakan tugas berikut dengan baik',
  NOW() + (ROW_NUMBER() OVER (ORDER BY gm.id) || ' days')::INTERVAL,
  NOW(),
  NOW()
FROM guru_mapel gm
LIMIT 5
ON CONFLICT DO NOTHING;

-- Insert TUGAS_SUBMIT (5 entries)
INSERT INTO tugas_submit (id, tugas_id, siswa_id, file_url, jawaban, submitted_at)
SELECT 
  gen_random_uuid(),
  t.id,
  (SELECT id FROM siswa ORDER BY random() LIMIT 1),
  'https://example.com/submit' || ROW_NUMBER() OVER (ORDER BY t.id) || '.pdf',
  'Jawaban tugas ' || ROW_NUMBER() OVER (ORDER BY t.id),
  NOW() - (ROW_NUMBER() OVER (ORDER BY t.id) || ' days')::INTERVAL
FROM tugas t
LIMIT 5
ON CONFLICT DO NOTHING;

-- Insert ABSENSI (5 entries)
INSERT INTO absensi (id, guru_mapel_id, kelas_id, tanggal, created_at)
SELECT 
  gen_random_uuid(),
  gm.id,
  gm.kelas_id,
  CURRENT_DATE - (ROW_NUMBER() OVER (ORDER BY gm.id) - 1)::integer,
  NOW()
FROM guru_mapel gm
LIMIT 5
ON CONFLICT DO NOTHING;

-- Insert ABSENSI_DETAIL (attendance details for existing absensi)
INSERT INTO absensi_detail (id, absensi_id, siswa_id, status)
SELECT 
  gen_random_uuid(),
  a.id,
  s.id,
  (ARRAY['hadir'::absensi_status, 'izin'::absensi_status, 'alfa'::absensi_status])[((ROW_NUMBER() OVER (PARTITION BY a.id ORDER BY s.id) - 1) % 3) + 1]
FROM absensi a
CROSS JOIN siswa s
WHERE (ROW_NUMBER() OVER (PARTITION BY a.id ORDER BY s.id)) <= 5
ON CONFLICT DO NOTHING;

-- Insert DISKUSI (5 topics)
INSERT INTO diskusi (id, guru_mapel_id, kelas_id, judul, deskripsi, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  gm.id,
  gm.kelas_id,
  'Diskusi Topik ' || ROW_NUMBER() OVER (ORDER BY gm.id),
  'Mari diskusikan materi pembelajaran ini',
  NOW(),
  NOW()
FROM guru_mapel gm
LIMIT 5
ON CONFLICT DO NOTHING;

-- Insert DISKUSI_POST (discussion posts)
INSERT INTO diskusi_post (id, diskusi_id, siswa_id, isi, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  d.id,
  (SELECT id FROM siswa ORDER BY random() LIMIT 1),
  'Pendapat saya tentang topik diskusi ' || ROW_NUMBER() OVER (PARTITION BY d.id ORDER BY d.id),
  NOW() + (ROW_NUMBER() OVER (PARTITION BY d.id ORDER BY d.id) || ' minutes')::INTERVAL,
  NOW() + (ROW_NUMBER() OVER (PARTITION BY d.id ORDER BY d.id) || ' minutes')::INTERVAL
FROM diskusi d
CROSS JOIN LATERAL (SELECT generate_series(1, 5)) AS i(n)
ON CONFLICT DO NOTHING;

-- Insert NILAI_MAPEL (5 scores)
INSERT INTO nilai_mapel (id, siswa_id, guru_mapel_id, nilai, semester, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  s.id,
  (SELECT id FROM guru_mapel ORDER BY random() LIMIT 1),
  70.0 + (ROW_NUMBER() OVER (ORDER BY s.id) * 3.5),
  1,
  NOW(),
  NOW()
FROM siswa s
LIMIT 5
ON CONFLICT (siswa_id, guru_mapel_id, semester) DO NOTHING;

-- Insert PEMBAYARAN_SPP (5 payments)
INSERT INTO pembayaran_spp (id, siswa_id, bulan, tahun, jumlah, metode_pembayaran, tanggal_bayar, status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  s.id,
  12,
  2024,
  1500000.00,
  (ARRAY['Bank Transfer', 'E-Wallet', 'Cicilan', 'Tunai', 'Cek'])[((ROW_NUMBER() OVER (ORDER BY s.id) - 1) % 5) + 1],
  NOW() - (ROW_NUMBER() OVER (ORDER BY s.id) * 5 || ' days')::INTERVAL,
  (ARRAY['paid'::pembayaran_status, 'pending'::pembayaran_status])[((ROW_NUMBER() OVER (ORDER BY s.id) - 1) % 2) + 1],
  NOW(),
  NOW()
FROM siswa s
LIMIT 5
ON CONFLICT (siswa_id, bulan, tahun) DO NOTHING;

-- Final verification
SELECT 'USERS' as table_name, COUNT(*) as total_records FROM users
UNION ALL
SELECT 'KELAS', COUNT(*) FROM kelas
UNION ALL
SELECT 'MAPEL', COUNT(*) FROM mapel
UNION ALL
SELECT 'GURU', COUNT(*) FROM guru
UNION ALL
SELECT 'SISWA', COUNT(*) FROM siswa
UNION ALL
SELECT 'GURU_MAPEL', COUNT(*) FROM guru_mapel
UNION ALL
SELECT 'MATERI', COUNT(*) FROM materi
UNION ALL
SELECT 'MATERI_VIEW', COUNT(*) FROM materi_view
UNION ALL
SELECT 'TUGAS', COUNT(*) FROM tugas
UNION ALL
SELECT 'TUGAS_SUBMIT', COUNT(*) FROM tugas_submit
UNION ALL
SELECT 'ABSENSI', COUNT(*) FROM absensi
UNION ALL
SELECT 'ABSENSI_DETAIL', COUNT(*) FROM absensi_detail
UNION ALL
SELECT 'DISKUSI', COUNT(*) FROM diskusi
UNION ALL
SELECT 'DISKUSI_POST', COUNT(*) FROM diskusi_post
UNION ALL
SELECT 'NILAI_MAPEL', COUNT(*) FROM nilai_mapel
UNION ALL
SELECT 'PEMBAYARAN_SPP', COUNT(*) FROM pembayaran_spp;
