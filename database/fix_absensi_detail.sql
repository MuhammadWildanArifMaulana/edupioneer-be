-- Insert ABSENSI_DETAIL manually (5 students per attendance)
INSERT INTO absensi_detail (id, absensi_id, siswa_id, status)
SELECT 
  gen_random_uuid() as id,
  a.id as absensi_id,
  s.id as siswa_id,
  CASE 
    WHEN random() < 0.7 THEN 'hadir'::absensi_status
    WHEN random() < 0.9 THEN 'izin'::absensi_status
    ELSE 'alfa'::absensi_status
  END as status
FROM absensi a
CROSS JOIN (SELECT * FROM siswa LIMIT 5) s
ON CONFLICT (absensi_id, siswa_id) DO NOTHING;

-- Verify results
SELECT 'Final Record Count:' as info;
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
