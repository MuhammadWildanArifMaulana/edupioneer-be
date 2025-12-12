-- Create join_requests table to track student requests to join kelas
CREATE TABLE join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siswa_id UUID NOT NULL,
  kelas_id UUID NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, accepted, rejected
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (siswa_id) REFERENCES siswa(id) ON DELETE CASCADE,
  FOREIGN KEY (kelas_id) REFERENCES kelas(id) ON DELETE CASCADE
);

CREATE INDEX idx_join_requests_siswa_id ON join_requests(siswa_id);
CREATE INDEX idx_join_requests_kelas_id ON join_requests(kelas_id);
CREATE INDEX idx_join_requests_status ON join_requests(status);
