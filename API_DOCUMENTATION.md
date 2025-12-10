# EduPioneer Backend API Documentation

Base URL: `http://localhost:3000/api`

## Authentication

Semua endpoint (kecuali `/auth/register` dan `/auth/login`) memerlukan JWT token di header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

Semua response menggunakan format JSON standar:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "statusCode": 200
}
```

Error response:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error",
  "statusCode": 400
}
```

---

## 🔐 Authentication Endpoints

### POST /auth/register

Mendaftarkan user baru (guru atau siswa).

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "siswa"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "siswa"
  },
  "statusCode": 201
}
```

**Validation Rules:**

- `email`: Required, valid email format
- `password`: Required, minimum 6 characters
- `name`: Required, minimum 3 characters
- `role`: Required, must be "guru" or "siswa"

---

### POST /auth/login

Login dan mendapatkan JWT token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "siswa",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "statusCode": 200
}
```

---

### GET /auth/me

Mendapatkan informasi user yang sedang login.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "siswa",
    "created_at": "2025-12-10T10:00:00Z"
  },
  "statusCode": 200
}
```

---

## 👥 Users Endpoints

### GET /users

List semua users dengan pagination.

**Query Parameters:**

```
page=1&limit=10
```

**Response (200):**

```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "siswa",
      "created_at": "2025-12-10T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  },
  "statusCode": 200
}
```

---

### GET /users/:id

Mendapatkan detail user by ID.

**Response (200):**

```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "siswa",
    "created_at": "2025-12-10T10:00:00Z"
  },
  "statusCode": 200
}
```

---

### PUT /users/:id

Update informasi user.

**Request Body:**

```json
{
  "name": "Jane Doe",
  "email": "newemail@example.com"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "uuid",
    "email": "newemail@example.com",
    "name": "Jane Doe",
    "role": "siswa",
    "created_at": "2025-12-10T10:00:00Z"
  },
  "statusCode": 200
}
```

---

### DELETE /users/:id

Menghapus user. **Requires admin role**.

**Response (200):**

```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": null,
  "statusCode": 200
}
```

---

## 📚 Kelas Endpoints

### GET /kelas

List semua kelas.

**Query Parameters:**

```
page=1&limit=10
```

**Response (200):**

```json
{
  "success": true,
  "message": "Kelas fetched successfully",
  "data": [
    {
      "id": "uuid",
      "nama": "X-A",
      "tahun_ajaran": "2024/2025",
      "semester": 1
    }
  ],
  "pagination": { ... },
  "statusCode": 200
}
```

---

### GET /kelas/:id

Mendapatkan detail kelas.

---

### POST /kelas

Membuat kelas baru. **Requires guru or admin role**.

**Request Body:**

```json
{
  "nama": "X-A",
  "tahun_ajaran": "2024/2025",
  "semester": 1
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Kelas created successfully",
  "data": {
    "id": "uuid",
    "nama": "X-A",
    "tahun_ajaran": "2024/2025",
    "semester": 1
  },
  "statusCode": 201
}
```

---

### PUT /kelas/:id

Update kelas. **Requires guru or admin role**.

---

### DELETE /kelas/:id

Menghapus kelas. **Requires admin role**.

---

## 📖 Mapel Endpoints

### GET /mapel

List semua mata pelajaran.

---

### GET /mapel/:id

Detail mapel.

---

### POST /mapel

Membuat mapel baru. **Requires guru or admin role**.

**Request Body:**

```json
{
  "nama": "Matematika"
}
```

---

### PUT /mapel/:id

Update mapel. **Requires guru or admin role**.

---

### DELETE /mapel/:id

Hapus mapel. **Requires admin role**.

---

## 🧑‍🏫 Guru Endpoints

### GET /guru

List semua guru.

---

### GET /guru/:id

Detail guru.

---

### GET /guru/:id/mapel

List mapel yang diajar guru.

**Response (200):**

```json
{
  "success": true,
  "message": "Guru mapel fetched successfully",
  "data": [
    {
      "id": "uuid",
      "guru_id": "uuid",
      "mapel_id": "uuid",
      "kelas_id": "uuid",
      "mapel_nama": "Matematika",
      "kelas_nama": "X-A"
    }
  ],
  "statusCode": 200
}
```

---

### POST /guru

Membuat guru baru. **Requires admin role**.

**Request Body:**

```json
{
  "user_id": "uuid",
  "nama": "Mr. Smith"
}
```

---

### POST /guru/assign-mapel

Assign mapel ke guru. **Requires admin role**.

**Request Body:**

```json
{
  "guru_id": "uuid",
  "mapel_id": "uuid",
  "kelas_id": "uuid"
}
```

---

### PUT /guru/:id

Update guru. **Requires admin role**.

---

### DELETE /guru/:id

Hapus guru. **Requires admin role**.

---

## 👨‍🎓 Siswa Endpoints

### GET /siswa

List semua siswa.

---

### GET /siswa/:id

Detail siswa.

---

### GET /siswa/:id/kelas

List siswa dalam kelas yang sama.

---

### POST /siswa

Membuat siswa baru. **Requires admin role**.

**Request Body:**

```json
{
  "user_id": "uuid",
  "nama": "John Student",
  "kelas_id": "uuid"
}
```

---

### PUT /siswa/:id

Update siswa. **Requires admin role**.

---

### DELETE /siswa/:id

Hapus siswa. **Requires admin role**.

---

## 📘 Materi Endpoints

### GET /materi

List materi. Bisa filter by guru_mapel_id.

**Query Parameters:**

```
guru_mapel_id=uuid&page=1&limit=10
```

---

### GET /materi/:id

Detail materi.

---

### POST /materi

Membuat materi baru. **Requires guru role**.

**Request Body:**

```json
{
  "guru_mapel_id": "uuid",
  "judul": "Bab 1: Aljabar",
  "deskripsi": "Pengenalan aljabar dasar",
  "file_url": "https://example.com/file.pdf"
}
```

---

### POST /materi/:id/view

Mencatat bahwa siswa telah melihat materi.

**Request Body:**

```json
{
  "siswa_id": "uuid"
}
```

---

### PUT /materi/:id

Update materi. **Requires guru role**.

---

### DELETE /materi/:id

Hapus materi. **Requires guru or admin role**.

---

## 📝 Tugas Endpoints

### GET /tugas

List tugas. Bisa filter by kelas_id.

**Query Parameters:**

```
kelas_id=uuid&page=1&limit=10
```

---

### GET /tugas/:id

Detail tugas.

---

### GET /tugas/:id/submits

List pengumpulan tugas.

**Response (200):**

```json
{
  "success": true,
  "message": "Tugas submits fetched successfully",
  "data": [
    {
      "id": "uuid",
      "tugas_id": "uuid",
      "siswa_id": "uuid",
      "siswa_nama": "John Doe",
      "file_url": "https://example.com/submission.pdf",
      "jawaban": "...",
      "submitted_at": "2025-12-10T10:00:00Z"
    }
  ],
  "statusCode": 200
}
```

---

### POST /tugas

Membuat tugas baru. **Requires guru role**.

**Request Body:**

```json
{
  "guru_mapel_id": "uuid",
  "kelas_id": "uuid",
  "judul": "Tugas PR Chapter 1",
  "deskripsi": "Kerjakan soal nomor 1-10",
  "deadline": "2025-12-20T23:59:59Z"
}
```

---

### POST /tugas/submit

Mengumpulkan tugas. **Requires siswa role**.

**Request Body:**

```json
{
  "tugas_id": "uuid",
  "siswa_id": "uuid",
  "file_url": "https://example.com/my-submission.pdf",
  "jawaban": "Jawaban tertulis"
}
```

---

### PUT /tugas/:id

Update tugas. **Requires guru role**.

---

### DELETE /tugas/:id

Hapus tugas. **Requires guru or admin role**.

---

## 📅 Absensi Endpoints

### GET /absensi

List absensi siswa.

**Query Parameters:**

```
siswa_id=uuid
```

---

### GET /absensi/:id

Detail absensi.

---

### GET /absensi/:id/detail

List detail absensi per siswa.

**Response (200):**

```json
{
  "success": true,
  "message": "Absensi details fetched successfully",
  "data": [
    {
      "id": "uuid",
      "absensi_id": "uuid",
      "siswa_id": "uuid",
      "siswa_nama": "John Doe",
      "status": "hadir"
    }
  ],
  "statusCode": 200
}
```

---

### POST /absensi

Membuka sesi absensi baru. **Requires guru role**.

**Request Body:**

```json
{
  "guru_mapel_id": "uuid",
  "kelas_id": "uuid",
  "tanggal": "2025-12-10"
}
```

---

### POST /absensi/:id/detail

Mencatat absensi siswa. **Requires guru role**.

**Request Body:**

```json
{
  "siswa_id": "uuid",
  "status": "hadir"
}
```

**Status values:** `hadir`, `izin`, `alfa`

---

### DELETE /absensi/:id

Hapus absensi. **Requires guru or admin role**.

---

## 💬 Diskusi Endpoints

### GET /diskusi

List forum diskusi.

**Query Parameters:**

```
kelas_id=uuid&page=1&limit=10
```

---

### GET /diskusi/:id

Detail diskusi.

---

### GET /diskusi/:id/posts

List postingan dalam diskusi.

**Response (200):**

```json
{
  "success": true,
  "message": "Diskusi posts fetched successfully",
  "data": [
    {
      "id": "uuid",
      "diskusi_id": "uuid",
      "siswa_id": "uuid",
      "siswa_nama": "John Doe",
      "isi": "Ini adalah postingan saya",
      "created_at": "2025-12-10T10:00:00Z"
    }
  ],
  "statusCode": 200
}
```

---

### POST /diskusi

Membuat diskusi baru. **Requires guru role**.

**Request Body:**

```json
{
  "guru_mapel_id": "uuid",
  "kelas_id": "uuid",
  "judul": "Diskusi: Aplikasi Aljabar",
  "deskripsi": "Mari diskusikan aplikasi aljabar dalam kehidupan sehari-hari"
}
```

---

### POST /diskusi/:id/post

Memposting di diskusi. **Requires siswa role**.

**Request Body:**

```json
{
  "siswa_id": "uuid",
  "isi": "Saya setuju dengan pendapat..."
}
```

---

### PUT /diskusi/:id

Update diskusi. **Requires guru role**.

---

### DELETE /diskusi/:id

Hapus diskusi. **Requires guru or admin role**.

---

## 🎓 Nilai Endpoints

### GET /nilai

List nilai. Bisa filter by siswa_id.

**Query Parameters:**

```
siswa_id=uuid&page=1&limit=10
```

---

### GET /nilai/:id

Detail nilai.

---

### POST /nilai

Membuat nilai baru. **Requires guru role**.

**Request Body:**

```json
{
  "siswa_id": "uuid",
  "guru_mapel_id": "uuid",
  "nilai": 85.5,
  "semester": 1
}
```

---

### PUT /nilai/:id

Update nilai. **Requires guru role**.

**Request Body:**

```json
{
  "nilai": 90.0,
  "semester": 1
}
```

---

### DELETE /nilai/:id

Hapus nilai. **Requires guru or admin role**.

---

## 💸 SPP (School Fees) Endpoints

### GET /spp

List pembayaran SPP.

**Query Parameters:**

```
page=1&limit=10
```

---

### GET /spp/:id

Detail pembayaran SPP.

---

### GET /spp/siswa-payments

List pembayaran SPP siswa.

**Query Parameters:**

```
siswa_id=uuid&tahun=2025
```

---

### POST /spp/pay

Membuat pembayaran SPP baru. **Requires siswa role**.

**Request Body:**

```json
{
  "siswa_id": "uuid",
  "bulan": 12,
  "tahun": 2025,
  "jumlah": 500000,
  "metode_pembayaran": "bank_transfer"
}
```

---

### PUT /spp/:id/status

Update status pembayaran. **Requires admin role**.

**Request Body:**

```json
{
  "status": "paid"
}
```

**Status values:** `paid`, `pending`, `overdue`

---

## ✅ Health Check

### GET /api/health

Check status server.

**Response (200):**

```json
{
  "status": "ok",
  "timestamp": "2025-12-10T10:00:00Z",
  "environment": "development"
}
```

---

## Error Codes

| Code | Message               | Description                              |
| ---- | --------------------- | ---------------------------------------- |
| 400  | Bad Request           | Validasi input gagal                     |
| 401  | Unauthorized          | Token tidak valid atau expired           |
| 403  | Forbidden             | Tidak memiliki akses (role tidak sesuai) |
| 404  | Not Found             | Resource tidak ditemukan                 |
| 409  | Conflict              | Data sudah ada (email duplikat, etc)     |
| 429  | Too Many Requests     | Rate limit tercapai                      |
| 500  | Internal Server Error | Error pada server                        |

---

## Rate Limiting

Setiap endpoint dibatasi maksimal 100 requests per 15 menit.

---

## Testing dengan cURL

### Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "siswa@example.com",
    "password": "password123",
    "name": "John Doe",
    "role": "siswa"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "siswa@example.com",
    "password": "password123"
  }'
```

### Get User Info (dengan token)

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### List Kelas

```bash
curl -X GET "http://localhost:3000/api/kelas?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Notes

- Semua waktu menggunakan format ISO 8601
- ID menggunakan UUID v4
- Database menggunakan PostgreSQL
- Password di-hash dengan bcrypt (10 salt rounds)
- JWT token berlaku 1 hari
