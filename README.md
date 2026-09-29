# Webservice SI-ASN BKN Gateway

Smart Reverse Proxy & API Gateway perantara untuk integrasi Web Service SI-ASN BKN (`SIASNAPI-SIMPEG`).

Aplikasi ini bertindak sebagai jembatan pada server yang memiliki IP Publik ter-whitelist oleh BKN. Aplikasi daerah (SIMPEG, Absensi, E-Kinerja, dsb.) cukup menembak ke gateway ini tanpa perlu mengelola token otentikasi BKN secara manual.

---

## Fitur Utama

- **Dual-Token Auto Injection**:
  - Otomatis melakukan *fetch* dan *auto-refresh* token WSO2 OAuth2 BKN (`Authorization: Bearer <token_wso2>`).
  - Menyematkan token SSO SIASN BKN (`Auth: Bearer <token_sso>`) dari konfigurasi `.env`.
- **Transparent Reverse Proxy**:
  - Meneruskan seluruh HTTP method (`GET`, `POST`, `PUT`, `DELETE`).
  - Mendukung transfer data JSON, URL-Encoded, dan file upload (`multipart/form-data`).
  - Mendukung streaming download dokumen berkas (format PDF) langsung dari server BKN.
  - Auto-retry 1x jika BKN merespon dengan `401 Unauthorized` karena token kedaluwarsa.
- **Swagger UI Interaktif**:
  - Dokumentasi API lengkap untuk pengembang aplikasi pengonsumsi data di `/api-docs`.
  - Berisi 91 endpoint dari 20 modul SIASN (Riwayat, Jabatan, SKP, Kinerja, Angka Kredit, CPNS, Diklat, Kursus, Hukdis, dsb.).

---

## Cara Menjalankan

### 1. Salin Konfigurasi Environment
```bash
cp .env.example .env
```
Sesuaikan nilai variabel di dalam file `.env`:
- `PORT`: Port server gateway (default: `3000`).
- `BKN_CONSUMER_KEY` & `BKN_CONSUMER_SECRET`: Kredensial API Manager WSO2 BKN.
- `TOKEN_AUTHx`: Token JWT SSO BKN.

### 2. Install Dependensi
```bash
npm install
```

### 3. Jalankan Aplikasi
Mode Pengembangan (dengan auto-reload):
```bash
npm run dev
```

Mode Produksi:
```bash
npm start
```

---

## Endpoint Penting

| Endpoint | Keterangan |
|---|---|
| `http://localhost:3000/api-docs` | **Swagger UI** dokumentasi interaktif untuk pengembang |
| `http://localhost:3000/health` | Status kesehatan gateway dan validitas token BKN |
| `http://localhost:3000/apisiasn/1.0/*` | Base URL Proxy (identik dengan endpoint BKN asli) |
| `http://localhost:3000/api/*` | Alias singkat Proxy |

---

## Contoh Pemanggilan dari Aplikasi Daerah

### Contoh 1: Ambil Data Utama PNS
```bash
curl -X GET "http://localhost:3000/apisiasn/1.0/pns/data-utama/198309222014101001"
```

### Contoh 2: Ambil Riwayat Jabatan
```bash
curl -X GET "http://localhost:3000/apisiasn/1.0/pns/rw-jabatan/198309222014101001"
```

### Contoh 3: Unduh Dokumen Berkas
```bash
curl -X GET "http://localhost:3000/apisiasn/1.0/download-dok?filePath=dms/F3C9EE2AA9110064E040640A02025755/xxx.pdf" --output dokumen.pdf
```

---

## Dokumentasi Checkpoint

Riwayat dan roadmap pengembangan tercatat lengkap di [CHECKPOINT.md](CHECKPOINT.md).
