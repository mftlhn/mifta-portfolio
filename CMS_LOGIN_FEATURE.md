# CMS Login Feature

Fitur login sederhana untuk melindungi akses ke halaman CMS dashboard.

## Fitur

✅ **Login Page** (`/login`) - Halaman login dengan password protection  
✅ **Protected Route** (`/cms`) - Dashboard CMS hanya bisa diakses setelah login  
✅ **Session Management** - Menggunakan HTTP-only cookies untuk keamanan  
✅ **Logout** - Tombol logout di halaman CMS untuk keluar  
✅ **Authentication Check** - Otomatis redirect ke login jika session tidak valid

## Setup

### Konfigurasi Password

Password default adalah `admin123`. Untuk mengubahnya, set environment variable:

```bash
# .env.local
CMS_PASSWORD=your_secure_password
```

## Cara Menggunakan

### 1. Akses Halaman Login

Buka browser dan navigasi ke:

```
http://localhost:3000/login
```

### 2. Masukkan Password

Masukkan password (default: `admin123`) dan klik tombol "Login"

### 3. Akses CMS Dashboard

Setelah login berhasil, Anda akan diarahkan ke:

```
http://localhost:3000/cms
```

### 4. Logout

Klik tombol "Logout" di halaman CMS untuk keluar dari session

## Arsitektur

### File-file yang Ditambahkan

```
app/
├── api/
│   └── auth/
│       ├── check/route.ts      # Endpoint untuk cek session
│       ├── login/route.ts       # Endpoint untuk login
│       └── logout/route.ts      # Endpoint untuk logout
├── login/
│   └── page.tsx                 # Halaman login
└── cms/
    └── page.tsx                 # Halaman CMS (modified)
lib/
└── auth.ts                      # Utility functions untuk auth
```

### API Endpoints

#### POST /api/auth/login

Validasi password dan set session cookie.

**Request:**

```json
{
  "password": "admin123"
}
```

**Response (Success):**

```json
{
  "message": "Login successful."
}
```

Set-Cookie: `cms_session=<token>; HttpOnly; Path=/; Max-Age=86400`

**Response (Error):**

```json
{
  "message": "Invalid password."
}
```

Status: 401

#### GET /api/auth/check

Cek apakah user memiliki valid session.

**Response (Valid):**

```json
{
  "message": "Authenticated."
}
```

Status: 200

**Response (Invalid):**

```json
{
  "message": "Unauthorized."
}
```

Status: 401

#### POST /api/auth/logout

Clear session cookie.

**Response:**

```json
{
  "message": "Logged out."
}
```

Set-Cookie: `cms_session=; HttpOnly; Path=/; Max-Age=0`

## Security Features

🔒 **HTTP-Only Cookies** - Melindungi dari XSS attacks  
🔒 **SameSite Policy** - Melindungi dari CSRF attacks  
🔒 **Secure Flag** - Cookie hanya dikirim via HTTPS di production  
🔒 **Session Expiration** - Cookie otomatis expire dalam 24 jam

## Pengembangan

### Running Development Server

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm start
```

## Catatan

- Password validation bersifat case-sensitive
- Session berlaku 24 jam
- Jika cookie terhapus/kadaluarsa, user akan diarahkan ke login page
- Default password di-set melalui environment variable `CMS_PASSWORD`
