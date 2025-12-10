-- Create ENUM types
CREATE TYPE user_role AS ENUM ('admin', 'guru', 'siswa');
CREATE TYPE absensi_status AS ENUM ('hadir', 'izin', 'alfa');
CREATE TYPE pembayaran_status AS ENUM ('paid', 'pending', 'overdue');

-- Roles table
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama VARCHAR(50) NOT NULL UNIQUE,
  deskripsi TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role user_role NOT NULL DEFAULT 'siswa',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Kelas table
CREATE TABLE kelas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama VARCHAR(100) NOT NULL,
  tahun_ajaran VARCHAR(20) NOT NULL,
  semester INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kelas_tahun_ajaran ON kelas(tahun_ajaran);

-- Mapel (Mata Pelajaran) table
CREATE TABLE mapel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Siswa table
CREATE TABLE siswa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  nama VARCHAR(100) NOT NULL,
  kelas_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (kelas_id) REFERENCES kelas(id) ON DELETE SET NULL
);

CREATE INDEX idx_siswa_kelas_id ON siswa(kelas_id);
CREATE INDEX idx_siswa_user_id ON siswa(user_id);

-- Guru table
CREATE TABLE guru (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  nama VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_guru_user_id ON guru(user_id);

-- Guru_Mapel (Guru mengajar Mapel di Kelas) table
CREATE TABLE guru_mapel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guru_id UUID NOT NULL,
  mapel_id UUID NOT NULL,
  kelas_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (guru_id) REFERENCES guru(id) ON DELETE CASCADE,
  FOREIGN KEY (mapel_id) REFERENCES mapel(id) ON DELETE CASCADE,
  FOREIGN KEY (kelas_id) REFERENCES kelas(id) ON DELETE CASCADE,
  UNIQUE(guru_id, mapel_id, kelas_id)
);

CREATE INDEX idx_guru_mapel_guru_id ON guru_mapel(guru_id);
CREATE INDEX idx_guru_mapel_mapel_id ON guru_mapel(mapel_id);
CREATE INDEX idx_guru_mapel_kelas_id ON guru_mapel(kelas_id);

-- Materi (Learning Materials) table
CREATE TABLE materi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guru_mapel_id UUID NOT NULL,
  judul VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  file_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (guru_mapel_id) REFERENCES guru_mapel(id) ON DELETE CASCADE
);

CREATE INDEX idx_materi_guru_mapel_id ON materi(guru_mapel_id);
CREATE INDEX idx_materi_created_at ON materi(created_at DESC);

-- Materi_View (Track materi views) table
CREATE TABLE materi_view (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  materi_id UUID NOT NULL,
  siswa_id UUID NOT NULL,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (materi_id) REFERENCES materi(id) ON DELETE CASCADE,
  FOREIGN KEY (siswa_id) REFERENCES siswa(id) ON DELETE CASCADE
);

CREATE INDEX idx_materi_view_materi_id ON materi_view(materi_id);
CREATE INDEX idx_materi_view_siswa_id ON materi_view(siswa_id);

-- Tugas (Assignments) table
CREATE TABLE tugas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guru_mapel_id UUID NOT NULL,
  kelas_id UUID NOT NULL,
  judul VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  deadline TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (guru_mapel_id) REFERENCES guru_mapel(id) ON DELETE CASCADE,
  FOREIGN KEY (kelas_id) REFERENCES kelas(id) ON DELETE CASCADE
);

CREATE INDEX idx_tugas_guru_mapel_id ON tugas(guru_mapel_id);
CREATE INDEX idx_tugas_kelas_id ON tugas(kelas_id);
CREATE INDEX idx_tugas_deadline ON tugas(deadline);

-- Tugas_Submit (Assignment submissions) table
CREATE TABLE tugas_submit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tugas_id UUID NOT NULL,
  siswa_id UUID NOT NULL,
  file_url VARCHAR(500),
  jawaban TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tugas_id) REFERENCES tugas(id) ON DELETE CASCADE,
  FOREIGN KEY (siswa_id) REFERENCES siswa(id) ON DELETE CASCADE
);

CREATE INDEX idx_tugas_submit_tugas_id ON tugas_submit(tugas_id);
CREATE INDEX idx_tugas_submit_siswa_id ON tugas_submit(siswa_id);

-- Absensi (Attendance) table
CREATE TABLE absensi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guru_mapel_id UUID NOT NULL,
  kelas_id UUID NOT NULL,
  tanggal DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (guru_mapel_id) REFERENCES guru_mapel(id) ON DELETE CASCADE,
  FOREIGN KEY (kelas_id) REFERENCES kelas(id) ON DELETE CASCADE
);

CREATE INDEX idx_absensi_guru_mapel_id ON absensi(guru_mapel_id);
CREATE INDEX idx_absensi_kelas_id ON absensi(kelas_id);
CREATE INDEX idx_absensi_tanggal ON absensi(tanggal);

-- Absensi_Detail (Attendance details per student) table
CREATE TABLE absensi_detail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  absensi_id UUID NOT NULL,
  siswa_id UUID NOT NULL,
  status absensi_status NOT NULL,
  FOREIGN KEY (absensi_id) REFERENCES absensi(id) ON DELETE CASCADE,
  FOREIGN KEY (siswa_id) REFERENCES siswa(id) ON DELETE CASCADE,
  UNIQUE(absensi_id, siswa_id)
);

CREATE INDEX idx_absensi_detail_absensi_id ON absensi_detail(absensi_id);
CREATE INDEX idx_absensi_detail_siswa_id ON absensi_detail(siswa_id);

-- Diskusi (Discussion) table
CREATE TABLE diskusi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guru_mapel_id UUID NOT NULL,
  kelas_id UUID NOT NULL,
  judul VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (guru_mapel_id) REFERENCES guru_mapel(id) ON DELETE CASCADE,
  FOREIGN KEY (kelas_id) REFERENCES kelas(id) ON DELETE CASCADE
);

CREATE INDEX idx_diskusi_guru_mapel_id ON diskusi(guru_mapel_id);
CREATE INDEX idx_diskusi_kelas_id ON diskusi(kelas_id);

-- Diskusi_Post (Discussion posts/comments) table
CREATE TABLE diskusi_post (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diskusi_id UUID NOT NULL,
  siswa_id UUID NOT NULL,
  isi TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (diskusi_id) REFERENCES diskusi(id) ON DELETE CASCADE,
  FOREIGN KEY (siswa_id) REFERENCES siswa(id) ON DELETE CASCADE
);

CREATE INDEX idx_diskusi_post_diskusi_id ON diskusi_post(diskusi_id);
CREATE INDEX idx_diskusi_post_siswa_id ON diskusi_post(siswa_id);

-- Nilai_Mapel (Grades per subject) table
CREATE TABLE nilai_mapel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siswa_id UUID NOT NULL,
  guru_mapel_id UUID NOT NULL,
  nilai DECIMAL(5, 2) NOT NULL,
  semester INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (siswa_id) REFERENCES siswa(id) ON DELETE CASCADE,
  FOREIGN KEY (guru_mapel_id) REFERENCES guru_mapel(id) ON DELETE CASCADE,
  UNIQUE(siswa_id, guru_mapel_id, semester)
);

CREATE INDEX idx_nilai_mapel_siswa_id ON nilai_mapel(siswa_id);
CREATE INDEX idx_nilai_mapel_guru_mapel_id ON nilai_mapel(guru_mapel_id);

-- Pembayaran_SPP (School fees payment) table
CREATE TABLE pembayaran_spp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siswa_id UUID NOT NULL,
  bulan INT NOT NULL,
  tahun INT NOT NULL,
  jumlah DECIMAL(12, 2) NOT NULL,
  metode_pembayaran VARCHAR(50) NOT NULL,
  tanggal_bayar TIMESTAMP NOT NULL,
  status pembayaran_status DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (siswa_id) REFERENCES siswa(id) ON DELETE CASCADE,
  UNIQUE(siswa_id, bulan, tahun)
);

CREATE INDEX idx_pembayaran_spp_siswa_id ON pembayaran_spp(siswa_id);
CREATE INDEX idx_pembayaran_spp_tahun ON pembayaran_spp(tahun);
CREATE INDEX idx_pembayaran_spp_status ON pembayaran_spp(status);

-- Seed default roles
INSERT INTO roles (nama, deskripsi) VALUES
  ('Admin', 'Administrator - Full access'),
  ('Guru', 'Teacher - Can manage classes and assignments'),
  ('Siswa', 'Student - Can view and submit assignments')
ON CONFLICT (nama) DO NOTHING;
