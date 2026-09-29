# Webservice SI-ASN BKN Gateway 🚀

Smart Reverse Proxy & API Gateway perantara untuk integrasi Web Service SI-ASN BKN (`SIASNAPI-SIMPEG`).

Aplikasi ini bertindak sebagai jembatan pada server yang memiliki IP Publik ter-whitelist oleh BKN. Aplikasi daerah (seperti **SIMPEG**, **Absensi**, **E-Kinerja**, dll.) cukup mengirimkan request ke gateway ini tanpa perlu mengelola dan menyuntikkan token otentikasi BKN secara manual.

---

## 📑 Daftar Isi
- [Latar Belakang & Arsitektur](#-latar-belakang--arsitektur)
- [Mekanisme Otentikasi Dual-Token](#-mekanisme-otentikasi-dual-token)
- [Fitur Utama Gateway](#-fitur-utama-gateway)
- [Katalog Modul & Endpoint](#-katalog-modul--endpoint)
- [Panduan Instalasi & Menjalankan](#-panduan-instalasi--menjalankan)
- [Konfigurasi Environment (.env)](#-konfigurasi-environment-env)
- [Panduan Integrasi Aplikasi Klien](#-panduan-integrasi-aplikasi-klien)
  - [1. Mengakses Swagger UI](#1-mengakses-swagger-ui)
  - [2. Contoh Request GET (Data Riwayat)](#2-contoh-request-get-data-riwayat)
  - [3. Contoh Request POST (Kirim Data JSON)](#3-contoh-request-post-kirim-data-json)
  - [4. Contoh Upload Dokumen (Multipart/Form-Data)](#4-contoh-upload-dokumen-multipartform-data)
  - [5. Contoh Download Dokumen Berkas (PDF)](#5-contoh-download-dokumen-berkas-pdf)
- [Menjalankan di Server Produksi (PM2)](#-menjalankan-di-server-produksi-pm2)
- [Status Code & Penanganan Error](#-status-code--penanganan-error)
- [Catatan Keamanan](#-catatan-keamanan)

---

## 🏛 Latar Belakang & Arsitektur

Web Service SI-ASN BKN menerapkan aturan keamanan ketat berupa **IP Whitelisting**. Hanya IP Publik server instansi/daerah yang didaftarkan ke BKN yang diperkenankan mengakses endpoint API BKN (`apimws.bkn.go.id:8243`).

Jika aplikasi daerah (SIMPEG lokal di intranet atau server lain) menembak langsung ke BKN, koneksi akan ditolak. Dengan memasang gateway ini pada server ber-IP ter-whitelist, seluruh aplikasi daerah dapat bertukar data dengan BKN secara aman dan terpusat.

```text
┌───────────────────────────────┐
│     Aplikasi Daerah (Klien)   │
│   (SIMPEG, E-Kinerja, dsb.)   │
└──────────────┬────────────────┘
               │  1. Request biasa tanpa token BKN
               │     GET /apisiasn/1.0/pns/data-utama/{nip}
               ▼
┌───────────────────────────────────────────────────────────────┐
│              WEBSERVICE SI-ASN BKN GATEWAY                    │
│           (Server Ber-IP Publik Ter-Whitelist)                │
│                                                               │
│   • Mengambil / me-refresh token WSO2 OAuth2                  │
│   • Mengambil token SSO BKN dari .env                         │
│   • Menyuntikkan:                                             │
│       - Header 'Authorization: Bearer <wso2_token>'           │
│       - Header 'Auth: Bearer <sso_token>'                     │
│   • Meneruskan request, streaming upload file, atau download  │
│   • Auto-retry 1x jika token hangus (401)                     │
└──────────────┬────────────────────────────────────────────────┘
               │  2. Request lengkap dengan Dual-Token
               ▼
┌───────────────────────────────┐
│      SERVER SI-ASN BKN        │
│   (apimws.bkn.go.id:8243)     │
└───────────────────────────────┘
```

---

## 🔑 Mekanisme Otentikasi Dual-Token

Setiap request ke Web Service SI-ASN BKN memerlukan dua header otentikasi sekaligus:

1. **`Authorization: Bearer <token_wso2>`**:
   - Dikelola **otomatis** oleh Gateway melalui mekanisme OAuth2 Client Credentials (`BKN_CONSUMER_KEY` & `BKN_CONSUMER_SECRET`).
   - Gateway menyimpan token ini di memori (*in-memory cache*) dan otomatis me-refresh sebelum masa aktifnya berakhir.
2. **`Auth: Bearer <token_sso>`**:
   - Diambil dari variabel `TOKEN_AUTHx` di file `.env`.
   - Disematkan otomatis pada setiap request keluar ke BKN.

---

## ✨ Fitur Utama Gateway

- **Transparent Passthrough (Reverse Proxy Dinamis):** Meneruskan semua HTTP Method (`GET`, `POST`, `PUT`, `DELETE`) tanpa perlu koding per endpoint.
- **Dukungan Berkas & Dokumen:**
  - Meneruskan upload berkas (`multipart/form-data`) seperti SK, sertifikat, dan foto profil.
  - Meneruskan unduhan dokumen PDF secara *binary stream*.
- **Auto-Retry & Self-Healing:** Jika BKN mengembalikan respon `401 Unauthorized`, gateway secara otomatis mengosongkan cache token WSO2, meminta token baru, dan mencoba kembali request tersebut 1 kali.
- **Swagger UI Interaktif:** Menyediakan katalog dokumentasi interaktif bagi developer daerah di endpoint `/api-docs`.
- **Health Check Endpoint:** Endpoint `/health` untuk memantau status gateway dan kesiapan token BKN.

---

## 📚 Katalog Modul & Endpoint

Gateway ini mencakup **91 endpoint** yang dikelompokkan ke dalam **20 modul** sesuai dokumen resmi BKN:

| No | Modul / Tag | Deskripsi Singkat | Contoh Endpoint Utama |
|---|---|---|---|
| 1 | **Data Utama & Riwayat PNS** | Pengambilan data profil dan 26 jenis riwayat PNS | `GET /pns/data-utama/{nipBaru}`<br>`GET /pns/rw-jabatan/{nipBaru}` |
| 2 | **Jabatan** | CRUD riwayat jabatan struktural / fungsional | `POST /jabatan/save`<br>`DELETE /jabatan/delete/{id}` |
| 3 | **Kinerja & SKP** | Manajemen SKP 2021, SKP 2022, & Kinerja Periodik | `POST /skp22/save`<br>`POST /skp22/document/save` |
| 4 | **Angka Kredit** | Manajemen Penetapan Angka Kredit (PAK) | `POST /angkakredit/save`<br>`POST /angkakredit/document/save` |
| 5 | **CPNS & Pengadaan** | Pengadaan ASN dan penetapan NIP | `POST /cpns/save`<br>`GET /pengadaan/list-pengadaan-instansi` |
| 6 | **Diklat & Kursus** | Riwayat diklat struktural dan kursus | `POST /diklat/document/save`<br>`POST /kursus/save` |
| 7 | **Hukuman Disiplin** | Pencatatan riwayat hukdis | `GET /hukdis/id/{id}`<br>`POST /hukdis/save` |
| 8 | **KGB & Masa Kerja** | Kenaikan gaji berkala & peninjauan masa kerja | `POST /kgb/save`<br>`DELETE /kgb/delete/{id}` |
| 9 | **Pemberhentian & Pensiun** | Usulan pensiun dan pemberhentian PNS | `GET /pns/list-pensiun-instansibynip`<br>`GET /pns/list-pensiun-instansi` |
| 10 | **Kenaikan Pangkat (KP)** | Pengecekan usulan KP instansi | `GET /pns/kp-instansi-byId`<br>`GET /pns/list-kp-instansi` |
| 11 | **Keluarga** | Riwayat data pasangan dan anak | `POST /keluarga/pasangan/save`<br>`POST /keluarga/anak/save` |
| 12 | **Kompetensi & Potensi** | Asesmen kompetensi dan pemetaan potensi | `POST /kompetensi/kompetensi/save`<br>`POST /kompetensi/potensi/save` |
| 13 | **Penghargaan** | Riwayat tanda jasa / penghargaan | `POST /penghargaan/save`<br>`POST /penghargaan/document/save` |
| 14 | **Sertifikasi** | Riwayat sertifikasi profesi | `POST /sertifikasi/save`<br>`DELETE /sertifikasi/delete/{id}` |
| 15 | **Tugas Belajar** | Riwayat izin / tugas belajar (Tubel) | `POST /tubel/save` |
| 16 | **Pencantuman Gelar & Talenta** | Usulan pencantuman gelar & Talent Mapping | `GET /partition/list-pg-instansi`<br>`POST /tm/talentmapping-save` |
| 17 | **Non ASN & IDIS** | Data non-ASN dan integrasi pelaporan IDIS | `GET /nonasn/data/{nik}`<br>`GET /idis/usulan-pelaporan` |
| 18 | **Referensi** | Referensi unit organisasi (Unor) dsb. | `GET /referensi/ref-unor` |
| 19 | **Dokumen & Unggah Berkas** | Download dokumen PDF streaming & upload berkas | `GET /download-dok?filePath=...`<br>`POST /upload-dok-rw`<br>`POST /upload-photo` |
| 20 | **Dashboard** | Aktivitas harian internal BKN | `DELETE /dashboard/aktivity/delete/{id}` |

---

## 🛠 Panduan Instalasi & Menjalankan

### Kebutuhan Sistem
- **Node.js**: Versi `>= 18.0.0` (Direkomendasikan Node.js LTS v20.x)
- **NPM**: Versi `>= 9.0.0`

### 1. Kloning Repository
```bash
git clone https://github.com/lowhanfish/webservice_si_asn_gateway.git
cd webservice_si_asn_gateway
```

### 2. Pasang Dependensi
```bash
npm install
```

### 3. Siapkan Konfigurasi `.env`
Salin template konfigurasi:
```bash
cp .env.example .env
```
Buka file `.env` dan isi kredensial yang sesuai.

### 4. Jalankan Aplikasi
Mode Pengembangan (dengan auto-reload):
```bash
npm run dev
```

Mode Standar:
```bash
npm start
```

---

## ⚙️ Konfigurasi Environment (`.env`)

| Variabel | Tipe | Contoh / Keterangan |
|---|---|---|
| `PORT` | Integer | `3005` (Port gateway berjalan) |
| `NODE_ENV` | String | `development` atau `production` |
| `BKN_BASE_URL` | URL | `https://apimws.bkn.go.id:8243/apisiasn/1.0` |
| `BKN_OAUTH2_URL` | URL | `https://apimws.bkn.go.id/oauth2/token` |
| `BKN_CONSUMER_KEY` | String | Consumer Key aplikasi dari API Manager BKN |
| `BKN_CONSUMER_SECRET` | String | Consumer Secret aplikasi dari API Manager BKN |
| `TOKEN_AUTHx` | String | Token JWT SSO SIASN BKN yang masih aktif |
| `BKN_SSO_MODE` | String | `manual` (direkomendasikan, memakai `TOKEN_AUTHx`) atau `auto` |

---

## 💻 Panduan Integrasi Aplikasi Klien

Aplikasi klien (SIMPEG / E-Kinerja) dapat memanggil gateway menggunakan prefix:
- `/apisiasn/1.0/...` (identik persis dengan URL BKN asli)
- `/api/...` (alias singkat)

### 1. Mengakses Swagger UI
Buka browser dan akses:
```text
http://localhost:3005/api-docs
```
Gunakan antarmuka ini untuk melihat daftar parameter, query, dan bentuk JSON yang diharapkan.

---

### 2. Contoh Request GET (Data Riwayat)

**cURL:**
```bash
curl -X GET "http://localhost:3005/apisiasn/1.0/pns/data-utama/198309222014101001" \
     -H "Accept: application/json"
```

**JavaScript (Fetch):**
```javascript
const response = await fetch('http://localhost:3005/apisiasn/1.0/pns/rw-jabatan/198309222014101001');
const result = await response.json();
console.log(result.data);
```

**PHP (cURL):**
```php
$ch = curl_init('http://localhost:3005/apisiasn/1.0/pns/data-utama/198309222014101001');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
print_r($data);
```

---

### 3. Contoh Request POST (Kirim Data JSON)

Contoh menyimpan riwayat kursus baru:

**cURL:**
```bash
curl -X POST "http://localhost:3005/apisiasn/1.0/kursus/save" \
     -H "Content-Type: application/json" \
     -d '{
       "pnsOrangId": "F3C9EE2AA9110064E040640A02025755",
       "namaKursus": "Bimtek Penerapan SPBE",
       "institusiPenyelenggara": "Kementerian Kominfo",
       "jenisDiklatId": "1",
       "jenisKursusId": "2",
       "jumlahJam": 32,
       "tahunKursus": 2024,
       "tanggalKursus": "10-05-2024",
       "tanggalSelesaiKursus": "14-05-2024",
       "nomorSertipikat": "500/KOMINFO/2024"
     }'
```

---

### 4. Contoh Upload Dokumen (Multipart/Form-Data)

Untuk mengunggah berkas SK atau sertifikat:

**cURL:**
```bash
curl -X POST "http://localhost:3005/apisiasn/1.0/upload-dok-rw" \
     -F "id_riwayat=8ae483a5..." \
     -F "id_ref_dokumen=872" \
     -F "file=@/path/to/sk_jabatan.pdf"
```

---

### 5. Contoh Download Dokumen Berkas (PDF)

Path file didapatkan dari atribut `path` pada response data riwayat PNS (misal: `dms/F3C9EE2AA9110064E040640A02025755/xxx.pdf`):

**cURL:**
```bash
curl -X GET "http://localhost:3005/apisiasn/1.0/download-dok?filePath=dms/F3C9EE2AA9110064E040640A02025755/xxx.pdf" \
     --output "dokumen_sk.pdf"
```

---

## 🚀 Menjalankan di Server Produksi (PM2)

Gunakan **PM2** agar service gateway tetap berjalan di latar belakang dan otomatis menyala kembali jika server reboot:

1. Install PM2 secara global:
   ```bash
   npm install -g pm2
   ```
2. Jalankan aplikasi:
   ```bash
   pm2 start src/server.js --name "si-asn-gateway"
   ```
3. Simpan state PM2:
   ```bash
   pm2 save
   pm2 startup
   ```
4. Cek log operasional:
   ```bash
   pm2 logs si-asn-gateway
   ```

---

## 🚦 Status Code & Penanganan Error

Gateway meneruskan respon status HTTP dari server BKN secara utuh:

- `200 OK`: Request sukses diproses oleh BKN.
- `400 Bad Request`: Format data / parameter yang dikirim salah atau tidak sesuai aturan validasi BKN.
- `401 Unauthorized`: Token BKN tidak valid / kedaluwarsa (Gateway otomatis me-refresh token WSO2).
- `404 Not Found`: Data riwayat atau NIP tidak ditemukan di server BKN.
- `502 Bad Gateway`: Terjadi jika server BKN sedang *down*, tidak bisa dijangkau dari server gateway, atau timeout.

---

## 🔒 Catatan Keamanan

1. **JANGAN PERNAH** mem-push file `.env` ke Git. File [`.gitignore`](.gitignore) sudah diatur untuk mengabaikan file `.env`.
2. Jika gateway ini dipasang pada server publik, pastikan port aplikasi (default: `3005`) dilindungi dengan firewall sehingga hanya bisa diakses oleh IP server SIMPEG internal Anda, atau pasang reverse proxy Nginx dengan API Key lokal / Basic Auth.
