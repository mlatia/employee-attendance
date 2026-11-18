# MyDexa – Employee Attendance System

Aplikasi web untuk mengelola data karyawan dan absensi harian secara digital. Sistem memiliki dua role, yaitu HRD dan Employee.

## Features

**HRD**
- Mengelola data karyawan (tambah, edit, dan nonaktifkan akun).
- Melihat dan memantau data absensi seluruh karyawan.
- Memfilter absensi berdasarkan tanggal dan karyawan.

**Employee**
- Login menggunakan akun yang dibuat HRD.
- Melakukan absensi dengan kamera atau galeri.
- Menambahkan catatan absensi.
- Melihat riwayat absensi pribadi.

## Tech Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS
- **Backend:** NestJS, TypeScript
- **Database:** MySQL
- **ORM:** TypeORM
- **Communication:** HTTP REST API & TCP Microservices

## Prerequisites

Pastikan sudah menginstal:
- Node.js 22+
- npm
- Docker Desktop
- Git

## Installation

**1. Clone repository**

```bash
git clone <repository-url>
cd employee-attendance
```

**2. Jalankan MySQL**

```bash
docker run --name mysql-attendance \
  -e MYSQL_ROOT_PASSWORD=<root-password> \
  -p 3306:3306 \
  -d mysql:8.4
```

**3. Setup backend**

```bash
cd backend
npm install
```

Salin `.env.example` menjadi `.env`, kemudian sesuaikan konfigurasi database, secret, dan akun seed.

**4. Setup database dan seed**

Jalankan SQL inisialisasi database sesuai file konfigurasi proyek, kemudian jalankan:

```bash
npm run seed:hrd
```

**5. Jalankan backend**

Jalankan setiap service pada terminal terpisah:

```bash
npm run start:dev
npm run start:identity
npm run start:attendance
```

**6. Jalankan frontend**

Buka terminal baru:

```bash
cd frontend
npm install
npm run dev
```

Buka aplikasi melalui:

```text
http://localhost:5173
```

## Demo Account

Gunakan akun yang dikonfigurasi melalui environment variable:

| Role | Email |
|---|---|
| HRD | `hrd@dexa.test` |
| Employee | `budi@dexa.test` |

Password mengikuti nilai `SEED_HRD_PASSWORD` dan `SEED_EMPLOYEE_PASSWORD` pada file `.env`.

## Notes

- Aplikasi berjalan secara lokal.
- Akses kamera memerlukan izin browser dan HTTPS atau localhost.
- Akun karyawan dibuat oleh HRD, bukan melalui registrasi mandiri.

## Architecture

MyDexa menggunakan **Microservices Architecture** dengan NestJS. Sistem dibagi menjadi tiga aplikasi backend yang memiliki tanggung jawab masing-masing.

### Services

1. **API Gateway (Port 3000)**
   - Menjadi entry point komunikasi antara frontend dan backend.
   - Menangani HTTP REST API.
   - Mengelola autentikasi dan otorisasi menggunakan JWT.
   - Meneruskan request ke Employee Service dan Attendance Service melalui TCP.

2. **Employee Service (Port 3001)**
   - Mengelola data karyawan dan akun pengguna.
   - Menangani proses login dan validasi kredensial.
   - Mengelola role dan status akun karyawan.
   - Mengelola database `identity_db`.

3. **Attendance Service (Port 3002)**
   - Menangani proses pencatatan absensi.
   - Menyimpan waktu, catatan, dan bukti foto absensi.
   - Mengelola riwayat dan monitoring absensi.
   - Mengelola database `attendance_db`.

### Service Communication

- Frontend berkomunikasi dengan API Gateway melalui HTTP REST API.
- API Gateway berkomunikasi dengan Employee Service dan Attendance Service menggunakan TCP.
- Setiap service memiliki tanggung jawab dan database masing-masing.
- Database diakses langsung oleh service pemiliknya, bukan oleh API Gateway.