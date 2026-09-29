# CHECKPOINT PENGEMBANGAN: WEBSERVICE SI-ASN GATEWAY

Dokumen ini mencatat status, arsitektur, dan checkpoint pengembangan proyek `webservice_si_asn_gateway`. File ini berfungsi sebagai panduan kesinambungan antar sesi kerja.

---

## 1. Ringkasan Proyek
- **Nama Proyek:** `webservice_si_asn_gateway`
- **Fungsi Utama:** Sebagai Smart Reverse Proxy / API Gateway perantara antara aplikasi internal daerah (SIMPEG, Absensi, E-Kinerja, dsb.) dengan Web Service SIASN BKN (`apimws.bkn.go.id`).
- **Latar Belakang:** API SIASN BKN hanya dapat diakses oleh IP Publik yang telah di-whitelist oleh BKN. Gateway ini dipasang pada server ter-whitelist untuk melayani request dari aplikasi daerah dan otomatis mengurus otentikasi dual-token BKN.
- **Fitur Dokumentasi:** Dilengkapi dengan Swagger UI interaktif (`/api-docs`) agar developer aplikasi pengonsumsi mengetahui method, path, parameter, dan body yang dibutuhkan untuk bertukar data tanpa pusing urusan otentikasi BKN.

---

## 2. Arsitektur Otentikasi BKN
1. **Header `Authorization: Bearer <token_wso2>`**:
   - Dikelola otomatis oleh Gateway via OAuth2 Client Credentials (`BKN_CONSUMER_KEY` & `BKN_CONSUMER_SECRET`).
   - Memiliki token cache dan auto-refresh sebelum masa aktif habis.
2. **Header `Auth: Bearer <token_sso>`**:
   - Diambil dari environment variable `TOKEN_AUTHx` di `.env`.

---

## 3. Roadmap Checkpoint

- [x] **Checkpoint 1: Setup & Fondasi**
  - Konfigurasi `.env` dan `.env.example`
  - Pembuatan file panduan kesinambungan `CHECKPOINT.md`
  - Inisialisasi `package.json` dan instalasi dependensi (Express, Axios, Swagger-UI-Express, Dotenv, Cors, Form-data)
  - Commit & Push ke Git

- [x] **Checkpoint 2: Token Management Service**
  - Implementasi service cerdas untuk auto-fetch & in-memory cache token WSO2
  - Pembaca token SSO dari `.env` (`TOKEN_AUTHx`)
  - Pengujian berhasil mengambil kedua token BKN
  - Commit & Push ke Git

- [ ] **Checkpoint 3: Core Gateway & Transparent Reverse Proxy**
  - Middleware proxy dinamis untuk meneruskan semua HTTP Method (`GET`, `POST`, `DELETE`, `PUT`) ke BKN
  - Penanganan file upload (`multipart/form-data`) dan file download (stream PDF)
  - Error handling terstandar
  - Commit & Push ke Git

- [ ] **Checkpoint 4: Swagger / OpenAPI 3.0 Documentation**
  - Dokumentasi OpenAPI lengkap berdasarkan spesifikasi BKN (Riwayat, Jabatan, SKP, Kinerja, Diklat, Kursus, Angka Kredit, CPNS, Dokumen/Upload, dsb.)
  - Integrasi Swagger UI pada endpoint `/api-docs`
  - Commit & Push ke Git

- [ ] **Checkpoint 5: Verifikasi & Finalisasi**
  - Pengujian server lokal dan verifikasi tampilan Swagger UI
  - Commit & Push akhir ke repository Git
