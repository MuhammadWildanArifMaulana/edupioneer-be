-- Clean up previous incomplete data (optional, uncomment if needed)
-- DELETE FROM pembayaran_spp;
-- DELETE FROM diskusi_post;
-- DELETE FROM diskusi;
-- DELETE FROM absensi_detail;
-- DELETE FROM absensi;
-- DELETE FROM tugas_submit;
-- DELETE FROM tugas;
-- DELETE FROM materi_view;
-- DELETE FROM materi;
-- DELETE FROM guru_mapel;
-- DELETE FROM siswa;
-- DELETE FROM guru;
-- DELETE FROM kelas;
-- DELETE FROM mapel;
-- DELETE FROM users;

-- ============================================================
-- 1. INSERT USERS (Admin, Guru, Siswa only - 5 per role)
-- ============================================================

-- Admin users (5)
INSERT INTO users (id, email, password, name, role, created_at, updated_at) VALUES
('650e8400-0000-0000-0000-000000000001', 'admin1@edupioneer.com', '$2b$10$YourHashedPasswordHere', 'Admin Utama', 'admin', NOW(), NOW()),
('650e8400-0000-0000-0000-000000000002', 'admin2@edupioneer.com', '$2b$10$YourHashedPasswordHere', 'Admin Sekunder', 'admin', NOW(), NOW()),
('650e8400-0000-0000-0000-000000000003', 'admin3@edupioneer.com', '$2b$10$YourHashedPasswordHere', 'Admin Support', 'admin', NOW(), NOW()),
('650e8400-0000-0000-0000-000000000004', 'admin4@edupioneer.com', '$2b$10$YourHashedPasswordHere', 'Admin IT', 'admin', NOW(), NOW()),
('650e8400-0000-0000-0000-000000000005', 'admin5@edupioneer.com', '$2b$10$YourHashedPasswordHere', 'Admin Finance', 'admin', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Guru users (5)
INSERT INTO users (id, email, password, name, role, created_at, updated_at) VALUES
('660e8400-0000-0000-0000-000000000001', 'guru1@edupioneer.com', '$2b$10$YourHashedPasswordHere', 'Guru Matematika', 'guru', NOW(), NOW()),
('660e8400-0000-0000-0000-000000000002', 'guru2@edupioneer.com', '$2b$10$YourHashedPasswordHere', 'Guru Bahasa Indonesia', 'guru', NOW(), NOW()),
('660e8400-0000-0000-0000-000000000003', 'guru3@edupioneer.com', '$2b$10$YourHashedPasswordHere', 'Guru Fisika', 'guru', NOW(), NOW()),
('660e8400-0000-0000-0000-000000000004', 'guru4@edupioneer.com', '$2b$10$YourHashedPasswordHere', 'Guru Kimia', 'guru', NOW(), NOW()),
('660e8400-0000-0000-0000-000000000005', 'guru5@edupioneer.com', '$2b$10$YourHashedPasswordHere', 'Guru Biologi', 'guru', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Siswa users (5)
INSERT INTO users (id, email, password, name, role, created_at, updated_at) VALUES
('670e8400-0000-0000-0000-000000000001', 'siswa1@edupioneer.com', '$2b$10$YourHashedPasswordHere', 'Ahmad Ridho', 'siswa', NOW(), NOW()),
('670e8400-0000-0000-0000-000000000002', 'siswa2@edupioneer.com', '$2b$10$YourHashedPasswordHere', 'Budi Santoso', 'siswa', NOW(), NOW()),
('670e8400-0000-0000-0000-000000000003', 'siswa3@edupioneer.com', '$2b$10$YourHashedPasswordHere', 'Citra Dewi', 'siswa', NOW(), NOW()),
('670e8400-0000-0000-0000-000000000004', 'siswa4@edupioneer.com', '$2b$10$YourHashedPasswordHere', 'Dani Pratama', 'siswa', NOW(), NOW()),
('670e8400-0000-0000-0000-000000000005', 'siswa5@edupioneer.com', '$2b$10$YourHashedPasswordHere', 'Eka Putri', 'siswa', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- 2. INSERT KELAS (5 kelas)
-- ============================================================
INSERT INTO kelas (id, nama, tahun_ajaran, semester, created_at, updated_at) VALUES
('750e8400-0000-0000-0000-000000000001', 'XI IPA 1', '2024/2025', 1, NOW(), NOW()),
('750e8400-0000-0000-0000-000000000002', 'XI IPA 2', '2024/2025', 1, NOW(), NOW()),
('750e8400-0000-0000-0000-000000000003', 'XI IPS 1', '2024/2025', 1, NOW(), NOW()),
('750e8400-0000-0000-0000-000000000004', 'XII IPA 1', '2024/2025', 1, NOW(), NOW()),
('750e8400-0000-0000-0000-000000000005', 'XII IPS 1', '2024/2025', 1, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ============================================================
-- 3. INSERT MAPEL (5 mata pelajaran)
-- ============================================================
INSERT INTO mapel (id, nama, created_at, updated_at) VALUES
('760e8400-0000-0000-0000-000000000001', 'Matematika', NOW(), NOW()),
('760e8400-0000-0000-0000-000000000002', 'Bahasa Indonesia', NOW(), NOW()),
('760e8400-0000-0000-0000-000000000003', 'Fisika', NOW(), NOW()),
('760e8400-0000-0000-0000-000000000004', 'Kimia', NOW(), NOW()),
('760e8400-0000-0000-0000-000000000005', 'Biologi', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ============================================================
-- 4. INSERT GURU (5 guru)
-- ============================================================
INSERT INTO guru (id, user_id, nama, created_at, updated_at) VALUES
('770e8400-0000-0000-0000-000000000001', '660e8400-0000-0000-0000-000000000001', 'Guru Matematika', NOW(), NOW()),
('770e8400-0000-0000-0000-000000000002', '660e8400-0000-0000-0000-000000000002', 'Guru Bahasa Indonesia', NOW(), NOW()),
('770e8400-0000-0000-0000-000000000003', '660e8400-0000-0000-0000-000000000003', 'Guru Fisika', NOW(), NOW()),
('770e8400-0000-0000-0000-000000000004', '660e8400-0000-0000-0000-000000000004', 'Guru Kimia', NOW(), NOW()),
('770e8400-0000-0000-0000-000000000005', '660e8400-0000-0000-0000-000000000005', 'Guru Biologi', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ============================================================
-- 5. INSERT SISWA (5 siswa with class assignment)
-- ============================================================
INSERT INTO siswa (id, user_id, nama, kelas_id, created_at, updated_at) VALUES
('780e8400-0000-0000-0000-000000000001', '670e8400-0000-0000-0000-000000000001', 'Ahmad Ridho', '750e8400-0000-0000-0000-000000000001', NOW(), NOW()),
('780e8400-0000-0000-0000-000000000002', '670e8400-0000-0000-0000-000000000002', 'Budi Santoso', '750e8400-0000-0000-0000-000000000001', NOW(), NOW()),
('780e8400-0000-0000-0000-000000000003', '670e8400-0000-0000-0000-000000000003', 'Citra Dewi', '750e8400-0000-0000-0000-000000000002', NOW(), NOW()),
('780e8400-0000-0000-0000-000000000004', '670e8400-0000-0000-0000-000000000004', 'Dani Pratama', '750e8400-0000-0000-0000-000000000002', NOW(), NOW()),
('780e8400-0000-0000-0000-000000000005', '670e8400-0000-0000-0000-000000000005', 'Eka Putri', '750e8400-0000-0000-0000-000000000003', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ============================================================
-- 6. INSERT GURU_MAPEL (5 guru teaches mapel in kelas)
-- ============================================================
INSERT INTO guru_mapel (id, guru_id, mapel_id, kelas_id, created_at) VALUES
('790e8400-0000-0000-0000-000000000001', '770e8400-0000-0000-0000-000000000001', '760e8400-0000-0000-0000-000000000001', '750e8400-0000-0000-0000-000000000001', NOW()),
('790e8400-0000-0000-0000-000000000002', '770e8400-0000-0000-0000-000000000002', '760e8400-0000-0000-0000-000000000002', '750e8400-0000-0000-0000-000000000001', NOW()),
('790e8400-0000-0000-0000-000000000003', '770e8400-0000-0000-0000-000000000003', '760e8400-0000-0000-0000-000000000003', '750e8400-0000-0000-0000-000000000002', NOW()),
('790e8400-0000-0000-0000-000000000004', '770e8400-0000-0000-0000-000000000004', '760e8400-0000-0000-0000-000000000004', '750e8400-0000-0000-0000-000000000002', NOW()),
('790e8400-0000-0000-0000-000000000005', '770e8400-0000-0000-0000-000000000005', '760e8400-0000-0000-0000-000000000005', '750e8400-0000-0000-0000-000000000003', NOW())
ON CONFLICT DO NOTHING;

-- ============================================================
-- 7. INSERT MATERI (5 materi)
-- ============================================================
INSERT INTO materi (id, guru_mapel_id, judul, deskripsi, file_url, created_at, updated_at) VALUES
('800e8400-0000-0000-0000-000000000001', '790e8400-0000-0000-0000-000000000001', 'Fungsi Kuadrat', 'Materi tentang fungsi kuadrat dan grafiknya', 'https://example.com/materi1.pdf', NOW(), NOW()),
('800e8400-0000-0000-0000-000000000002', '790e8400-0000-0000-0000-000000000002', 'Puisi Modern', 'Analisis puisi modern Indonesia', 'https://example.com/materi2.pdf', NOW(), NOW()),
('800e8400-0000-0000-0000-000000000003', '790e8400-0000-0000-0000-000000000003', 'Kinematika', 'Gerak benda dan percepatan', 'https://example.com/materi3.pdf', NOW(), NOW()),
('800e8400-0000-0000-0000-000000000004', '790e8400-0000-0000-0000-000000000004', 'Reaksi Kimia', 'Jenis-jenis reaksi kimia', 'https://example.com/materi4.pdf', NOW(), NOW()),
('800e8400-0000-0000-0000-000000000005', '790e8400-0000-0000-0000-000000000005', 'Sel Biologi', 'Struktur dan fungsi sel', 'https://example.com/materi5.pdf', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ============================================================
-- 8. INSERT MATERI_VIEW (5 views)
-- ============================================================
INSERT INTO materi_view (id, materi_id, siswa_id, viewed_at) VALUES
('810e8400-0000-0000-0000-000000000001', '800e8400-0000-0000-0000-000000000001', '780e8400-0000-0000-0000-000000000001', NOW()),
('810e8400-0000-0000-0000-000000000002', '800e8400-0000-0000-0000-000000000002', '780e8400-0000-0000-0000-000000000002', NOW()),
('810e8400-0000-0000-0000-000000000003', '800e8400-0000-0000-0000-000000000003', '780e8400-0000-0000-0000-000000000003', NOW()),
('810e8400-0000-0000-0000-000000000004', '800e8400-0000-0000-0000-000000000004', '780e8400-0000-0000-0000-000000000004', NOW()),
('810e8400-0000-0000-0000-000000000005', '800e8400-0000-0000-0000-000000000005', '780e8400-0000-0000-0000-000000000005', NOW())
ON CONFLICT DO NOTHING;

-- ============================================================
-- 9. INSERT TUGAS (5 tugas)
-- ============================================================
INSERT INTO tugas (id, guru_mapel_id, kelas_id, judul, deskripsi, deadline, created_at, updated_at) VALUES
('820e8400-0000-0000-0000-000000000001', '790e8400-0000-0000-0000-000000000001', '750e8400-0000-0000-0000-000000000001', 'Latihan Fungsi Kuadrat', 'Kerjakan soal nomor 1-10', NOW() + INTERVAL '7 days', NOW(), NOW()),
('820e8400-0000-0000-0000-000000000002', '790e8400-0000-0000-0000-000000000002', '750e8400-0000-0000-0000-000000000001', 'Analisis Puisi', 'Analisis 3 puisi pilihan Anda', NOW() + INTERVAL '5 days', NOW(), NOW()),
('820e8400-0000-0000-0000-000000000003', '790e8400-0000-0000-0000-000000000003', '750e8400-0000-0000-0000-000000000002', 'Percobaan Kinematika', 'Lakukan percobaan dan laporkan hasilnya', NOW() + INTERVAL '10 days', NOW(), NOW()),
('820e8400-0000-0000-0000-000000000004', '790e8400-0000-0000-0000-000000000004', '750e8400-0000-0000-0000-000000000002', 'Balancing Persamaan Kimia', 'Seimbangkan 15 persamaan kimia', NOW() + INTERVAL '6 days', NOW(), NOW()),
('820e8400-0000-0000-0000-000000000005', '790e8400-0000-0000-0000-000000000005', '750e8400-0000-0000-0000-000000000003', 'Gambar Struktur Sel', 'Buat diagram struktur sel dengan label', NOW() + INTERVAL '8 days', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ============================================================
-- 10. INSERT TUGAS_SUBMIT (5 submissions)
-- ============================================================
INSERT INTO tugas_submit (id, tugas_id, siswa_id, file_url, jawaban, submitted_at) VALUES
('830e8400-0000-0000-0000-000000000001', '820e8400-0000-0000-0000-000000000001', '780e8400-0000-0000-0000-000000000001', 'https://example.com/submit1.pdf', 'Jawaban tugas fungsi kuadrat', NOW() - INTERVAL '2 days'),
('830e8400-0000-0000-0000-000000000002', '820e8400-0000-0000-0000-000000000002', '780e8400-0000-0000-0000-000000000002', 'https://example.com/submit2.pdf', 'Analisis puisi dengan penjelasan detail', NOW() - INTERVAL '1 day'),
('830e8400-0000-0000-0000-000000000003', '820e8400-0000-0000-0000-000000000003', '780e8400-0000-0000-0000-000000000003', 'https://example.com/submit3.pdf', 'Laporan percobaan lengkap', NOW() - INTERVAL '3 days'),
('830e8400-0000-0000-0000-000000000004', '820e8400-0000-0000-0000-000000000004', '780e8400-0000-0000-0000-000000000004', 'https://example.com/submit4.pdf', 'Persamaan kimia seimbang', NOW() - INTERVAL '1 day'),
('830e8400-0000-0000-0000-000000000005', '820e8400-0000-0000-0000-000000000005', '780e8400-0000-0000-0000-000000000005', 'https://example.com/submit5.pdf', 'Gambar sel dengan label lengkap', NOW() - INTERVAL '2 days')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 11. INSERT ABSENSI (5 attendance records)
-- ============================================================
INSERT INTO absensi (id, guru_mapel_id, kelas_id, tanggal, created_at) VALUES
('840e8400-0000-0000-0000-000000000001', '790e8400-0000-0000-0000-000000000001', '750e8400-0000-0000-0000-000000000001', CURRENT_DATE, NOW()),
('840e8400-0000-0000-0000-000000000002', '790e8400-0000-0000-0000-000000000002', '750e8400-0000-0000-0000-000000000001', CURRENT_DATE - 1, NOW()),
('840e8400-0000-0000-0000-000000000003', '790e8400-0000-0000-0000-000000000003', '750e8400-0000-0000-0000-000000000002', CURRENT_DATE - 2, NOW()),
('840e8400-0000-0000-0000-000000000004', '790e8400-0000-0000-0000-000000000004', '750e8400-0000-0000-0000-000000000002', CURRENT_DATE - 3, NOW()),
('840e8400-0000-0000-0000-000000000005', '790e8400-0000-0000-0000-000000000005', '750e8400-0000-0000-0000-000000000003', CURRENT_DATE - 4, NOW())
ON CONFLICT DO NOTHING;

-- ============================================================
-- 12. INSERT ABSENSI_DETAIL (attendance details)
-- ============================================================
INSERT INTO absensi_detail (id, absensi_id, siswa_id, status) VALUES
-- Attendance 1
('850e8400-0000-0000-0000-000000000001', '840e8400-0000-0000-0000-000000000001', '780e8400-0000-0000-0000-000000000001', 'hadir'::absensi_status),
('850e8400-0000-0000-0000-000000000002', '840e8400-0000-0000-0000-000000000001', '780e8400-0000-0000-0000-000000000002', 'izin'::absensi_status),
('850e8400-0000-0000-0000-000000000003', '840e8400-0000-0000-0000-000000000001', '780e8400-0000-0000-0000-000000000003', 'hadir'::absensi_status),
('850e8400-0000-0000-0000-000000000004', '840e8400-0000-0000-0000-000000000001', '780e8400-0000-0000-0000-000000000004', 'alfa'::absensi_status),
('850e8400-0000-0000-0000-000000000005', '840e8400-0000-0000-0000-000000000001', '780e8400-0000-0000-0000-000000000005', 'hadir'::absensi_status),
-- Attendance 2
('850e8400-0000-0000-0000-000000000006', '840e8400-0000-0000-0000-000000000002', '780e8400-0000-0000-0000-000000000001', 'hadir'::absensi_status),
('850e8400-0000-0000-0000-000000000007', '840e8400-0000-0000-0000-000000000002', '780e8400-0000-0000-0000-000000000002', 'hadir'::absensi_status),
('850e8400-0000-0000-0000-000000000008', '840e8400-0000-0000-0000-000000000002', '780e8400-0000-0000-0000-000000000003', 'izin'::absensi_status),
('850e8400-0000-0000-0000-000000000009', '840e8400-0000-0000-0000-000000000002', '780e8400-0000-0000-0000-000000000004', 'hadir'::absensi_status),
('850e8400-0000-0000-0000-000000000010', '840e8400-0000-0000-0000-000000000002', '780e8400-0000-0000-0000-000000000005', 'hadir'::absensi_status)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 13. INSERT DISKUSI (5 discussion topics)
-- ============================================================
INSERT INTO diskusi (id, guru_mapel_id, kelas_id, judul, deskripsi, created_at, updated_at) VALUES
('860e8400-0000-0000-0000-000000000001', '790e8400-0000-0000-0000-000000000001', '750e8400-0000-0000-0000-000000000001', 'Tips Menguasai Fungsi Kuadrat', 'Diskusikan cara-cara efektif memahami fungsi kuadrat', NOW(), NOW()),
('860e8400-0000-0000-0000-000000000002', '790e8400-0000-0000-0000-000000000002', '750e8400-0000-0000-0000-000000000001', 'Puisi Favorit Anda', 'Bagikan puisi favorit dan alasannya', NOW(), NOW()),
('860e8400-0000-0000-0000-000000000003', '790e8400-0000-0000-0000-000000000003', '750e8400-0000-0000-0000-000000000002', 'Aplikasi Fisika dalam Kehidupan', 'Diskusi tentang penerapan fisika sehari-hari', NOW(), NOW()),
('860e8400-0000-0000-0000-000000000004', '790e8400-0000-0000-0000-000000000004', '750e8400-0000-0000-0000-000000000002', 'Eksperimen Kimia Menarik', 'Share pengalaman eksperimen kimia yang unik', NOW(), NOW()),
('860e8400-0000-0000-0000-000000000005', '790e8400-0000-0000-0000-000000000005', '750e8400-0000-0000-0000-000000000003', 'Evolusi dan Adaptasi', 'Diskusi teori evolusi dan adaptasi makhluk hidup', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ============================================================
-- 14. INSERT DISKUSI_POST (5 discussion posts)
-- ============================================================
INSERT INTO diskusi_post (id, diskusi_id, siswa_id, isi, created_at, updated_at) VALUES
-- Discussion 1 posts
('870e8400-0000-0000-0000-000000000001', '860e8400-0000-0000-0000-000000000001', '780e8400-0000-0000-0000-000000000001', 'Saya belajar dengan membuat grafik sendiri, sangat membantu!', NOW(), NOW()),
('870e8400-0000-0000-0000-000000000002', '860e8400-0000-0000-0000-000000000001', '780e8400-0000-0000-0000-000000000002', 'Sama, visualisasi membuat lebih mudah diingat', NOW() + INTERVAL '1 hour', NOW() + INTERVAL '1 hour'),
('870e8400-0000-0000-0000-000000000003', '860e8400-0000-0000-0000-000000000001', '780e8400-0000-0000-0000-000000000003', 'Ada yang tahu rumus cepat untuk menghitung vertex?', NOW() + INTERVAL '2 hours', NOW() + INTERVAL '2 hours'),
('870e8400-0000-0000-0000-000000000004', '860e8400-0000-0000-0000-000000000001', '780e8400-0000-0000-0000-000000000004', 'Rumusnya x = -b/2a untuk vertex', NOW() + INTERVAL '3 hours', NOW() + INTERVAL '3 hours'),
('870e8400-0000-0000-0000-000000000005', '860e8400-0000-0000-0000-000000000001', '780e8400-0000-0000-0000-000000000005', 'Terima kasih untuk tipsnya!', NOW() + INTERVAL '4 hours', NOW() + INTERVAL '4 hours'),
-- Discussion 2 posts
('870e8400-0000-0000-0000-000000000006', '860e8400-0000-0000-0000-000000000002', '780e8400-0000-0000-0000-000000000001', 'Puisi "Aku" karya Chairil Anwar sangat berkesan', NOW(), NOW()),
('870e8400-0000-0000-0000-000000000007', '860e8400-0000-0000-0000-000000000002', '780e8400-0000-0000-0000-000000000002', 'Puisi modern lebih ekspresif dan relatable', NOW() + INTERVAL '1 hour', NOW() + INTERVAL '1 hour'),
('870e8400-0000-0000-0000-000000000008', '860e8400-0000-0000-0000-000000000002', '780e8400-0000-0000-0000-000000000003', 'Saya suka "Semua Adalah Rakus" - sangat dalam', NOW() + INTERVAL '2 hours', NOW() + INTERVAL '2 hours'),
('870e8400-0000-0000-0000-000000000009', '860e8400-0000-0000-0000-000000000002', '780e8400-0000-0000-0000-000000000004', 'Karya Sapardi Djoko Damono juga bagus', NOW() + INTERVAL '3 hours', NOW() + INTERVAL '3 hours'),
('870e8400-0000-0000-0000-000000000010', '860e8400-0000-0000-0000-000000000002', '780e8400-0000-0000-0000-000000000005', 'Ada yang bisa merekomendasikan puisi baru?', NOW() + INTERVAL '4 hours', NOW() + INTERVAL '4 hours')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 15. INSERT NILAI_MAPEL (5 scores)
-- ============================================================
INSERT INTO nilai_mapel (id, siswa_id, guru_mapel_id, nilai, semester, created_at, updated_at) VALUES
('880e8400-0000-0000-0000-000000000001', '780e8400-0000-0000-0000-000000000001', '790e8400-0000-0000-0000-000000000001', 85.50, 1, NOW(), NOW()),
('880e8400-0000-0000-0000-000000000002', '780e8400-0000-0000-0000-000000000002', '790e8400-0000-0000-0000-000000000002', 78.00, 1, NOW(), NOW()),
('880e8400-0000-0000-0000-000000000003', '780e8400-0000-0000-0000-000000000003', '790e8400-0000-0000-0000-000000000003', 92.75, 1, NOW(), NOW()),
('880e8400-0000-0000-0000-000000000004', '780e8400-0000-0000-0000-000000000004', '790e8400-0000-0000-0000-000000000004', 88.25, 1, NOW(), NOW()),
('880e8400-0000-0000-0000-000000000005', '780e8400-0000-0000-0000-000000000005', '790e8400-0000-0000-0000-000000000005', 81.50, 1, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ============================================================
-- 16. INSERT PEMBAYARAN_SPP (5 SPP payments)
-- ============================================================
INSERT INTO pembayaran_spp (id, siswa_id, bulan, tahun, jumlah, metode_pembayaran, tanggal_bayar, status, created_at, updated_at) VALUES
('890e8400-0000-0000-0000-000000000001', '780e8400-0000-0000-0000-000000000001', 12, 2024, 1500000.00, 'Bank Transfer', NOW() - INTERVAL '5 days', 'paid'::pembayaran_status, NOW(), NOW()),
('890e8400-0000-0000-0000-000000000002', '780e8400-0000-0000-0000-000000000002', 11, 2024, 1500000.00, 'E-Wallet', NOW() - INTERVAL '10 days', 'paid'::pembayaran_status, NOW(), NOW()),
('890e8400-0000-0000-0000-000000000003', '780e8400-0000-0000-0000-000000000003', 12, 2024, 1500000.00, 'Bank Transfer', NOW() - INTERVAL '1 day', 'paid'::pembayaran_status, NOW(), NOW()),
('890e8400-0000-0000-0000-000000000004', '780e8400-0000-0000-0000-000000000004', 12, 2024, 1500000.00, 'Cicilan', NOW() - INTERVAL '15 days', 'pending'::pembayaran_status, NOW(), NOW()),
('890e8400-0000-0000-0000-000000000005', '780e8400-0000-0000-0000-000000000005', 11, 2024, 1500000.00, 'Bank Transfer', NOW() - INTERVAL '20 days', 'paid'::pembayaran_status, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ============================================================
-- VERIFICATION: Show record counts
-- ============================================================
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
