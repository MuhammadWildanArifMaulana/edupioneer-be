-- Clean up inconsistent old data
DELETE FROM pembayaran_spp WHERE siswa_id NOT IN (
  SELECT id FROM siswa WHERE user_id IN (
    SELECT id FROM users WHERE email LIKE 'siswa%@edupioneer.com'
  )
);

DELETE FROM diskusi_post WHERE siswa_id NOT IN (
  SELECT id FROM siswa WHERE user_id IN (
    SELECT id FROM users WHERE email LIKE 'siswa%@edupioneer.com'
  )
);

DELETE FROM diskusi WHERE id NOT IN (
  SELECT diskusi_id FROM diskusi_post
);

DELETE FROM tugas_submit WHERE siswa_id NOT IN (
  SELECT id FROM siswa WHERE user_id IN (
    SELECT id FROM users WHERE email LIKE 'siswa%@edupioneer.com'
  )
);

DELETE FROM tugas WHERE id NOT IN (
  SELECT tugas_id FROM tugas_submit
);

DELETE FROM materi_view WHERE siswa_id NOT IN (
  SELECT id FROM siswa WHERE user_id IN (
    SELECT id FROM users WHERE email LIKE 'siswa%@edupioneer.com'
  )
);

DELETE FROM materi WHERE id NOT IN (
  SELECT materi_id FROM materi_view
);

DELETE FROM absensi_detail WHERE siswa_id NOT IN (
  SELECT id FROM siswa WHERE user_id IN (
    SELECT id FROM users WHERE email LIKE 'siswa%@edupioneer.com'
  )
);

DELETE FROM absensi WHERE id NOT IN (
  SELECT absensi_id FROM absensi_detail
);

DELETE FROM nilai_mapel WHERE siswa_id NOT IN (
  SELECT id FROM siswa WHERE user_id IN (
    SELECT id FROM users WHERE email LIKE 'siswa%@edupioneer.com'
  )
);

DELETE FROM guru_mapel WHERE id NOT IN (
  SELECT guru_mapel_id FROM materi
  UNION
  SELECT guru_mapel_id FROM tugas
  UNION
  SELECT guru_mapel_id FROM absensi
  UNION
  SELECT guru_mapel_id FROM diskusi
  UNION
  SELECT guru_mapel_id FROM nilai_mapel
);

DELETE FROM siswa WHERE user_id NOT IN (
  SELECT id FROM users WHERE email LIKE 'siswa%@edupioneer.com'
);

DELETE FROM guru WHERE user_id NOT IN (
  SELECT id FROM users WHERE email LIKE 'guru%@edupioneer.com'
);

DELETE FROM users WHERE email LIKE 'user@gmail.com' OR email LIKE 'wildan@gmail.com' OR email LIKE 'guru1@example.com';

SELECT 'Cleanup complete' as message;
