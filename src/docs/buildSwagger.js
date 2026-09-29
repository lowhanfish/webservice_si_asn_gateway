const fs = require('fs');
const path = require('path');

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Webservice SI-ASN BKN Gateway API',
    version: '1.0.0',
    description: `### Dokumentasi Gateway Integrasi Web Service SI-ASN BKN (SIASNAPI-SIMPEG)
Gateway ini bertindak sebagai **Reverse Proxy** yang mengurus autentikasi Dual-Token BKN (WSO2 OAuth2 & SSO) secara transparan.

**Panduan Penggunaan untuk Pengembang Aplikasi Daerah:**
1. Semua request dikirim ke Gateway ini tanpa perlu pusing menyisipkan token BKN.
2. Gateway otomatis menambahkan header \`Authorization: Bearer <wso2_token>\` dan \`Auth: Bearer <sso_token>\`.
3. URL dasar gateway dapat dipanggil menggunakan prefix \`/apisiasn/1.0\` atau \`/api\`.
4. Untuk unduh berkas gunakan endpoint \`/download-dok?filePath=...\` yang akan langsung mengalirkan file PDF dari BKN.`
  },
  servers: [
    {
      url: '/apisiasn/1.0',
      description: 'Default Proxy Gateway (/apisiasn/1.0)'
    },
    {
      url: '/api',
      description: 'Shorthand Proxy Gateway (/api)'
    }
  ],
  tags: [
    { name: 'Data Utama & Riwayat PNS', description: 'Pengambilan data utama dan berbagai riwayat kepegawaian PNS berdasar NIP' },
    { name: 'Jabatan', description: 'Manajemen riwayat jabatan struktural / fungsional' },
    { name: 'Kinerja & SKP', description: 'Pengelolaan SKP 2021, SKP 2022, dan Kinerja Periodik' },
    { name: 'Angka Kredit', description: 'Pengelolaan data riwayat penetapan angka kredit (PAK)' },
    { name: 'CPNS & Pengadaan', description: 'Data pengadaan CPNS / penetapan NIP' },
    { name: 'Diklat & Kursus', description: 'Riwayat diklat struktural, fungsional, teknis, dan kursus' },
    { name: 'Hukuman Disiplin', description: 'Pencatatan dan riwayat hukuman disiplin PNS' },
    { name: 'KGB & Masa Kerja', description: 'Riwayat kenaikan gaji berkala dan masa kerja' },
    { name: 'Pemberhentian & Pensiun', description: 'Daftar usulan pensiun dan pemberhentian PNS' },
    { name: 'Kenaikan Pangkat (KP)', description: 'Pengecekan usulan kenaikan pangkat PNS' },
    { name: 'Keluarga', description: 'Pencatatan data keluarga PNS (pasangan dan anak)' },
    { name: 'Kompetensi & Potensi', description: 'Data hasil asesmen kompetensi dan pemetaan potensi' },
    { name: 'Penghargaan', description: 'Riwayat tanda jasa / penghargaan' },
    { name: 'Sertifikasi', description: 'Riwayat sertifikasi profesi / keahlian' },
    { name: 'Tugas Belajar', description: 'Pencatatan riwayat izin / tugas belajar' },
    { name: 'Pencantuman Gelar & Talenta', description: 'Usulan pencantuman gelar profesi dan Talent Mapping' },
    { name: 'Non ASN & IDIS', description: 'Data Non-ASN dan pelaporan disiplin pada sistem IDIS BKN' },
    { name: 'Referensi', description: 'Data referensi BKN seperti unit organisasi (unor) dan lembaga' },
    { name: 'Dokumen & Unggah Berkas', description: 'Upload dokumen riwayat, SK, foto profil, dan download dokumen' },
    { name: 'Dashboard', description: 'Aktivitas harian internal SIASN' }
  ],
  paths: {}
};

// Helper pembuatan path
function addGet(pathUrl, tag, summary, params = []) {
  if (!swaggerSpec.paths[pathUrl]) swaggerSpec.paths[pathUrl] = {};
  swaggerSpec.paths[pathUrl].get = {
    tags: [tag],
    summary: summary,
    parameters: params.map(p => ({
      name: p.name,
      in: p.in || 'path',
      required: p.required !== false,
      description: p.description || p.name,
      schema: { type: p.type || 'string' }
    })),
    responses: {
      '200': { description: 'Berhasil menerima respon dari BKN SIASN' },
      '400': { description: 'Parameter request tidak valid' },
      '404': { description: 'Data tidak ditemukan di BKN' },
      '500': { description: 'Kesalahan internal server BKN' }
    }
  };
}

function addDelete(pathUrl, tag, summary, params = []) {
  if (!swaggerSpec.paths[pathUrl]) swaggerSpec.paths[pathUrl] = {};
  swaggerSpec.paths[pathUrl].delete = {
    tags: [tag],
    summary: summary,
    parameters: params.map(p => ({
      name: p.name,
      in: p.in || 'path',
      required: p.required !== false,
      description: p.description || p.name,
      schema: { type: p.type || 'string' }
    })),
    responses: {
      '200': { description: 'Berhasil dihapus dari BKN' },
      '400': { description: 'Request tidak valid' }
    }
  };
}

function addPostJson(pathUrl, tag, summary, sampleBody = {}, params = []) {
  if (!swaggerSpec.paths[pathUrl]) swaggerSpec.paths[pathUrl] = {};
  swaggerSpec.paths[pathUrl].post = {
    tags: [tag],
    summary: summary,
    parameters: params.map(p => ({
      name: p.name,
      in: p.in || 'path',
      required: p.required !== false,
      schema: { type: p.type || 'string' }
    })),
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            example: sampleBody
          }
        }
      }
    },
    responses: {
      '200': { description: 'Berhasil diproses oleh BKN' },
      '400': { description: 'Validasi data gagal' }
    }
  };
}

function addPostMultipart(pathUrl, tag, summary, properties = {}, requiredProps = []) {
  if (!swaggerSpec.paths[pathUrl]) swaggerSpec.paths[pathUrl] = {};
  swaggerSpec.paths[pathUrl].post = {
    tags: [tag],
    summary: summary,
    requestBody: {
      required: true,
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            required: requiredProps,
            properties: properties
          }
        }
      }
    },
    responses: {
      '200': { description: 'Berhasil mengunggah dokumen ke BKN' }
    }
  };
}

// 1. DATA UTAMA & RIWAYAT PNS
const nipParam = [{ name: 'nipBaru', in: 'path', description: 'NIP Pegawai (18 digit)' }];

addGet('/pns/data-utama/{nipBaru}', 'Data Utama & Riwayat PNS', 'Get Data Utama PNS Lengkap', nipParam);
addGet('/pns/rw-jabatan/{nipBaru}', 'Data Utama & Riwayat PNS', 'Get Riwayat Jabatan PNS', nipParam);
addGet('/pns/rw-golongan/{nipBaru}', 'Data Utama & Riwayat PNS', 'Get Riwayat Golongan / Pangkat PNS', nipParam);
addGet('/pns/rw-pendidikan/{nipBaru}', 'Data Utama & Riwayat PNS', 'Get Riwayat Pendidikan PNS', nipParam);
addGet('/pns/rw-diklat/{nipBaru}', 'Data Utama & Riwayat PNS', 'Get Riwayat Diklat Struktural PNS', nipParam);
addGet('/pns/rw-kursus/{nipBaru}', 'Data Utama & Riwayat PNS', 'Get Riwayat Kursus PNS', nipParam);
addGet('/pns/rw-hukdis/{nipBaru}', 'Data Utama & Riwayat PNS', 'Get Riwayat Hukuman Disiplin PNS', nipParam);
addGet('/pns/rw-skp/{nipBaru}', 'Data Utama & Riwayat PNS', 'Get Riwayat SKP PNS', nipParam);
addGet('/pns/rw-skp22/{nipBaru}', 'Data Utama & Riwayat PNS', 'Get Riwayat SKP 2022 PNS', nipParam);
addGet('/pns/rw-kinerjaperiodik/{nipBaru}', 'Data Utama & Riwayat PNS', 'Get Riwayat Kinerja Periodik PNS', nipParam);
addGet('/pns/rw-angkakredit/{nipBaru}', 'Data Utama & Riwayat PNS', 'Get Riwayat Angka Kredit PNS', nipParam);
addGet('/pns/rw-cltn/{nipBaru}', 'Data Utama & Riwayat PNS', 'Get Riwayat Cuti di Luar Tanggungan Negara (CLTN)', nipParam);
addGet('/pns/rw-kontrak/{nipBaru}', 'Data Utama & Riwayat PNS', 'Get Riwayat Kontrak PPPK', nipParam);
addGet('/pns/rw-potensi/{nipBaru}', 'Data Utama & Riwayat PNS', 'Get Riwayat Potensi PNS', nipParam);
addGet('/pns/rw-kompetensi/{nipBaru}', 'Data Utama & Riwayat PNS', 'Get Riwayat Kompetensi PNS', nipParam);
addGet('/pns/rw-dp3/{nipBaru}', 'Data Utama & Riwayat PNS', 'Get Riwayat DP3 PNS', nipParam);
addGet('/pns/rw-sertifikasi/{nipBaru}', 'Data Utama & Riwayat PNS', 'Get Riwayat Sertifikasi PNS', nipParam);
addGet('/pns/rw-masakerja/{nipBaru}', 'Data Utama & Riwayat PNS', 'Get Riwayat Masa Kerja PNS', nipParam);
addGet('/pns/rw-kgb/{nipBaru}', 'Data Utama & Riwayat PNS', 'Get Riwayat Kenaikan Gaji Berkala (KGB) PNS', nipParam);
addGet('/pns/rw-pemberhentian/{nipBaru}', 'Data Utama & Riwayat PNS', 'Get Riwayat Pemberhentian PNS', nipParam);
addGet('/pns/rw-tubel/{nipBaru}', 'Data Utama & Riwayat PNS', 'Get Riwayat Tugas Belajar (Tubel) PNS', nipParam);
addGet('/pns/rw-penghargaan/{nipBaru}', 'Data Utama & Riwayat PNS', 'Get Riwayat Penghargaan PNS', nipParam);
addGet('/pns/rw-pindahinstansi/{nipBaru}', 'Data Utama & Riwayat PNS', 'Get Riwayat Pindah Instansi PNS', nipParam);
addGet('/pns/rw-pnsunor/{nipBaru}', 'Data Utama & Riwayat PNS', 'Get Riwayat PNS Unor', nipParam);
addGet('/pns/rw-pwk/{nipBaru}', 'Data Utama & Riwayat PNS', 'Get Riwayat PWK PNS', nipParam);
addGet('/pns/nilaiipasn/{nipBaru}', 'Data Utama & Riwayat PNS', 'Get Nilai IP ASN', nipParam);

// 2. JABATAN
addGet('/jabatan/id/{idRiwayatJabatan}', 'Jabatan', 'Get Detail Riwayat Jabatan by ID', [{ name: 'idRiwayatJabatan', in: 'path' }]);
addGet('/jabatan/pns/{nipBaru}', 'Jabatan', 'Get Data Jabatan PNS', nipParam);
addPostJson('/jabatan/save', 'Jabatan', 'Simpan / Tambah Riwayat Jabatan', {
  id: '',
  pnsId: 'string',
  instansiId: 'string',
  instansiIndukId: 'string',
  satuanKerjaId: 'string',
  unorId: 'string',
  eselonId: 'string',
  jenisJabatan: '1',
  jabatanFungsionalId: '',
  jabatanFungsionalUmumId: '',
  nomorSk: 'string',
  tanggalSk: 'dd-mm-yyyy',
  tmtJabatan: 'dd-mm-yyyy',
  tmtPelantikan: 'dd-mm-yyyy'
});
addPostJson('/jabatan/unorjabatan/save', 'Jabatan', 'Simpan Data Unor Jabatan PNS', {
  id: '',
  pnsId: 'string',
  instansiId: 'string',
  satuanKerjaId: 'string',
  unorId: 'string',
  subJabatanId: 'string',
  tmtJabatan: 'dd-mm-yyyy'
});
addDelete('/jabatan/delete/{idRiwayatJabatan}', 'Jabatan', 'Hapus Riwayat Jabatan', [{ name: 'idRiwayatJabatan', in: 'path' }]);
addPostMultipart('/jabatan/unorjabatan/document/save', 'Jabatan', 'Simpan Riwayat Jabatan beserta Dokumen SK', {
  id: { type: 'string', description: 'ID Riwayat Jabatan (kosongkan jika buat baru)' },
  pns_id: { type: 'string', description: 'ID PNS BKN' },
  jenis_jabatan: { type: 'string', description: '1=struktural, 2=fungsional, 4=pelaksana' },
  unor_id: { type: 'string' },
  eselon_id: { type: 'string' },
  instansi_id: { type: 'string' },
  instansi_induk_id: { type: 'string' },
  satuan_kerja_id: { type: 'string' },
  jabatan_fungsional_id: { type: 'string' },
  jabatan_fungsional_umum_id: { type: 'string' },
  nomor_sk: { type: 'string' },
  tanggal_sk: { type: 'string', description: 'dd-mm-yyyy' },
  tmt_jabatan: { type: 'string', description: 'dd-mm-yyyy' },
  tmt_pelantikan: { type: 'string', description: 'dd-mm-yyyy' },
  dok_sk_jabatan: { type: 'string', format: 'binary', description: 'File SK Jabatan (PDF)' },
  dok_surat_pelantikan: { type: 'string', format: 'binary', description: 'File Surat Pelantikan (PDF)' },
  dok_sk_mutasi: { type: 'string', format: 'binary', description: 'File SK Mutasi (PDF)' }
});

// 3. ANGKA KREDIT
addGet('/angkakredit/id/{idRiwayatAngkaKredit}', 'Angka Kredit', 'Get Detail Riwayat Angka Kredit by ID', [{ name: 'idRiwayatAngkaKredit', in: 'path' }]);
addDelete('/angkakredit/delete/{idRiwayatAngkaKredit}', 'Angka Kredit', 'Hapus Riwayat Angka Kredit', [{ name: 'idRiwayatAngkaKredit', in: 'path' }]);
addPostJson('/angkakredit/save', 'Angka Kredit', 'Simpan Riwayat Angka Kredit', {
  id: '',
  pnsId: 'string',
  nomorSk: 'string',
  tanggalSk: 'dd-mm-yyyy',
  bulanMulaiPenilaian: '1',
  tahunMulaiPenilaian: '2023',
  bulanSelesaiPenilaian: '12',
  tahunSelesaiPenilaian: '2023',
  kreditUtamaBaru: '10.500',
  kreditPenunjangBaru: '2.000',
  kreditBaruTotal: '12.500',
  rwJabatanId: 'string',
  isAngkaKreditPertama: '0',
  isIntegrasi: '0',
  isKonversi: '0'
});
addPostMultipart('/angkakredit/document/save', 'Angka Kredit', 'Simpan Riwayat Angka Kredit dengan Dokumen PAK', {
  id: { type: 'string' },
  pns_id: { type: 'string' },
  nomor_sk: { type: 'string' },
  tanggal_sk: { type: 'string', description: 'dd-mm-yyyy' },
  bulan_mulai_penilaian: { type: 'string' },
  tahun_mulai_penilaian: { type: 'string' },
  bulan_selesai_penilaian: { type: 'string' },
  tahun_selesai_penilaian: { type: 'string' },
  kredit_utama_baru: { type: 'string' },
  kredit_penunjang_baru: { type: 'string' },
  kredit_baru_total: { type: 'string' },
  rw_jabatan_id: { type: 'string' },
  is_angka_kredit_pertama: { type: 'string' },
  is_integrasi: { type: 'string' },
  is_konversi: { type: 'string' },
  dok_pak: { type: 'string', format: 'binary', description: 'File Dokumen PAK (PDF)' },
  sk_pak: { type: 'string', format: 'binary', description: 'File Dokumen SK PAK (PDF)' }
});

// 4. KINERJA & SKP
addGet('/skp/id/{idRiwayatSkp}', 'Kinerja & SKP', 'Get Riwayat SKP by ID', [{ name: 'idRiwayatSkp', in: 'path' }]);
addPostJson('/skp/save', 'Kinerja & SKP', 'Simpan Riwayat SKP', {
  id: '',
  pns: 'string',
  tahun: '2021',
  nilaiSkp: '85.5',
  orientasiPelayanan: '85',
  integritas: '85',
  komitmen: '85',
  disiplin: '85',
  kerjasama: '85',
  kepemimpinan: '0',
  jumlah: '425',
  nilairatarata: '85',
  statusPenilai: '1',
  pejabatPenilai: 'string'
});
addPostJson('/skp/2021/save', 'Kinerja & SKP', 'Simpan Riwayat SKP Tahun 2021', {
  id: '',
  pns: 'string',
  tahun: 2021,
  nilaiSkp: 85,
  orientasiPelayanan: 85,
  integritas: 85,
  komitmen: 85,
  disiplin: 85,
  kerjasama: 85,
  kepemimpinan: 0,
  inisiatifKerja: 85
});
addGet('/skp22/id/{idRiwayatSkp22}', 'Kinerja & SKP', 'Get Riwayat SKP 2022 by ID', [{ name: 'idRiwayatSkp22', in: 'path' }]);
addPostJson('/skp22/save', 'Kinerja & SKP', 'Simpan Riwayat SKP 2022', {
  id: '',
  pnsDinilaiOrang: 'string',
  tahun: 2022,
  hasilKinerjaNilai: 1,
  perilakuKerjaNilai: 1,
  kuadranKinerjaNilai: 1,
  penilaiNipNrp: 'string',
  penilaiNama: 'string',
  penilaiJabatan: 'string',
  penilaiGolongan: 'string',
  penilaiUnorNama: 'string',
  statusPenilai: 'ASN'
});
addPostMultipart('/skp22/document/save', 'Kinerja & SKP', 'Simpan Riwayat SKP 2022 beserta Dokumen Evaluasi', {
  id: { type: 'string' },
  pnsDinilaiOrang: { type: 'string' },
  tahun: { type: 'integer' },
  hasilKinerjaNilai: { type: 'number' },
  perilakuKerjaNilai: { type: 'number' },
  kuadranKinerjaNilai: { type: 'number' },
  penilaiNipNrp: { type: 'string' },
  penilaiNama: { type: 'string' },
  penilaiUnorNama: { type: 'string' },
  penilaiJabatan: { type: 'string' },
  penilaiGolongan: { type: 'string' },
  statusPenilai: { type: 'string' },
  file: { type: 'string', format: 'binary', description: 'File Dokumen SKP (PDF)' }
});
addDelete('/kinerjaperiodik/delete/{idRiwayatKinerjaPeriodik}', 'Kinerja & SKP', 'Hapus Riwayat Kinerja Periodik', [{ name: 'idRiwayatKinerjaPeriodik', in: 'path' }]);
addPostJson('/kinerjaperiodik/save', 'Kinerja & SKP', 'Simpan Riwayat Kinerja Periodik', {
  id: '',
  pnsDinilaiId: 'string',
  tahun: 2024,
  periodikId: 'string',
  bulanMulaiPenilaian: 1,
  bulanSelesaiPenilaian: 3,
  hasilKinerjaNilai: 1,
  perilakuKerjaNilai: 1,
  kuadranKinerjaNilai: 1
});

// 5. CPNS & PENGADAAN
addPostJson('/cpns/save', 'CPNS & Pengadaan', 'Simpan Data Riwayat CPNS / PNS', {
  id: '',
  pns_orang_id: 'string',
  nomor_sk_cpns: 'string',
  tgl_sk_cpns: 'dd-mm-yyyy',
  tmt_cpns: 'dd-mm-yyyy',
  nomor_sk_pns: 'string',
  tgl_sk_pns: 'dd-mm-yyyy',
  tmt_pns: 'dd-mm-yyyy',
  nomor_sttpl: 'string',
  tgl_sttpl: 'dd-mm-yyyy',
  nomor_spmt: 'string',
  tmt_melaksanakan_tugas: 'dd-mm-yyyy'
});
addPostMultipart('/cpns/document/save', 'CPNS & Pengadaan', 'Simpan Riwayat CPNS dengan Dokumen Berkas', {
  pns_orang_id: { type: 'string' },
  status_cpns_pns: { type: 'string' },
  nomor_sk_cpns: { type: 'string' },
  tgl_sk_cpns: { type: 'string' },
  nomor_sk_pns: { type: 'string' },
  tgl_sk_pns: { type: 'string' },
  tmt_pns: { type: 'string' },
  nomor_spmt: { type: 'string' },
  nomor_sttpl: { type: 'string' },
  tgl_sttpl: { type: 'string' },
  kartu_pegawai: { type: 'string' },
  nomor_dokter_pns: { type: 'string' },
  nama_jabatan_angkat_cpns: { type: 'string' },
  tmt_melaksanakan_tugas: { type: 'string' },
  file: { type: 'string', format: 'binary', description: 'File Dokumen CPNS/PNS (PDF)' }
});
addGet('/pengadaan/dokumen-pengadaan', 'CPNS & Pengadaan', 'Get Dokumen Pengadaan ASN by Tahun Anggaran', [
  { name: 'tahun', in: 'query', type: 'integer' }
]);
addGet('/pengadaan/list-pengadaan-instansi', 'CPNS & Pengadaan', 'Get List Pengadaan Instansi by Tahun', [
  { name: 'tahun', in: 'query', type: 'integer' },
  { name: 'limit', in: 'query', type: 'integer' },
  { name: 'offset', in: 'query', type: 'integer' }
]);

// 6. DIKLAT & KURSUS
addPostMultipart('/diklat/document/save', 'Diklat & Kursus', 'Simpan Riwayat Diklat Struktural beserta Sertifikat', {
  id: { type: 'string' },
  pns_orang_id: { type: 'string' },
  latihan_struktural_id: { type: 'string' },
  nomor: { type: 'string' },
  tanggal: { type: 'string', description: 'dd-mm-yyyy' },
  tanggal_selesai: { type: 'string', description: 'dd-mm-yyyy' },
  bobot: { type: 'integer' },
  jenis_kompetensi: { type: 'string' },
  jumlah_jam: { type: 'integer' },
  tahun: { type: 'integer' },
  institusi_penyelenggara: { type: 'string' },
  file: { type: 'string', format: 'binary', description: 'File Dokumen Sertifikat Diklat (PDF)' }
});
addGet('/kursus/id/{idRiwayatKursus}', 'Diklat & Kursus', 'Get Detail Riwayat Kursus by ID', [{ name: 'idRiwayatKursus', in: 'path' }]);
addDelete('/kursus/delete/{idRiwayatKursus}', 'Diklat & Kursus', 'Hapus Riwayat Kursus', [{ name: 'idRiwayatKursus', in: 'path' }]);
addPostJson('/kursus/save', 'Diklat & Kursus', 'Simpan Riwayat Kursus PNS', {
  id: '',
  pnsOrangId: 'string',
  namaKursus: 'string',
  institusiPenyelenggara: 'string',
  jenisDiklatId: 'string',
  jenisKursusId: 'string',
  jumlahJam: 40,
  tahunKursus: 2024,
  tanggalKursus: 'dd-mm-yyyy',
  tanggalSelesaiKursus: 'dd-mm-yyyy',
  nomorSertipikat: 'string'
});
addPostMultipart('/kursus/document/save', 'Diklat & Kursus', 'Simpan Riwayat Kursus beserta Sertifikat (PDF)', {
  id: { type: 'string' },
  pns_orang_id: { type: 'string' },
  jenis_diklat_id: { type: 'string' },
  jenis_kursus_id: { type: 'string' },
  instansi_id: { type: 'string' },
  nama_kursus: { type: 'string' },
  institusi_penyelenggara: { type: 'string' },
  jumlah_jam: { type: 'integer' },
  tahun_kursus: { type: 'integer' },
  tanggal_kursus: { type: 'string' },
  tanggal_selesai_kursus: { type: 'string' },
  nomor_sertipikat: { type: 'string' },
  lokasi_id: { type: 'string' },
  file: { type: 'string', format: 'binary', description: 'File Sertifikat Kursus (PDF)' }
});

// 7. HUKUMAN DISIPLIN
addGet('/hukdis/id/{idRiwayatHukdis}', 'Hukuman Disiplin', 'Get Detail Riwayat Hukdis by ID', [{ name: 'idRiwayatHukdis', in: 'path' }]);
addPostJson('/hukdis/save', 'Hukuman Disiplin', 'Simpan Data Riwayat Hukuman Disiplin', {
  id: '',
  pnsOrangId: 'string',
  hukumanTanggal: 'dd-mm-yyyy',
  skNomor: 'string',
  skTanggal: 'dd-mm-yyyy',
  masaTahun: 1,
  masaBulan: 0,
  akhirHukumTanggal: 'dd-mm-yyyy',
  jenisHukumanId: 'string',
  jenisTingkatHukumanId: 'string',
  alasanHukumanDisiplinId: 'string',
  keterangan: 'string'
});

// 8. KGB & MASA KERJA
addPostJson('/kgb/save', 'KGB & Masa Kerja', 'Simpan Riwayat Kenaikan Gaji Berkala (KGB)', {
  id: '',
  pnsId: 'string',
  gajiBaru: 'string',
  gajiLama: 'string',
  nomorSk: 'string',
  tanggalSk: 'dd-mm-yyyy',
  tmtGajiBaru: 'dd-mm-yyyy',
  masaKerja: 'string'
});
addDelete('/kgb/delete/{idRiwayatKgb}', 'KGB & Masa Kerja', 'Hapus Riwayat KGB', [{ name: 'idRiwayatKgb', in: 'path' }]);

// 9. PEMBERHENTIAN & PENSIUN
addGet('/pns/list-pensiun-instansibynip', 'Pemberhentian & Pensiun', 'Get List Usulan Pensiun Berdasarkan NIP', [
  { name: 'nip', in: 'query', description: 'NIP Pegawai' }
]);
addGet('/pns/list-pensiun-instansi', 'Pemberhentian & Pensiun', 'Get List Usulan Pensiun Instansi by Rentang Tanggal', [
  { name: 'tglAwal', in: 'query', description: 'dd-mm-yyyy' },
  { name: 'tglAkhir', in: 'query', description: 'dd-mm-yyyy' }
]);

// 10. KENAIKAN PANGKAT (KP)
addGet('/pns/kp-instansi-byId', 'Kenaikan Pangkat (KP)', 'Get Status Usulan KP Instansi by ID Usulan', [
  { name: 'idUsulan', in: 'query', description: 'ID Usulan KP BKN' }
]);
addGet('/pns/list-kp-instansi', 'Kenaikan Pangkat (KP)', 'Get List Usulan KP Instansi by Periode', [
  { name: 'periode', in: 'query', description: 'yyyy-mm-dd' },
  { name: 'limit', in: 'query', type: 'integer' },
  { name: 'offset', in: 'query', type: 'integer' }
]);

// 11. KELUARGA
addPostJson('/keluarga/pasangan/save', 'Keluarga', 'Simpan Data Riwayat Pasangan (Suami/Istri)', {
  id: '',
  pnsOrangId: 'string',
  nama: 'string',
  tempatLahir: 'string',
  tglLahir: 'dd-mm-yyyy',
  jenisKelamin: 'F',
  agamaId: '1',
  statusPernikahan: '1',
  tglAktaMenikah: 'dd-mm-yyyy',
  noAktaMenikah: 'string',
  statusHidup: '1'
});
addPostJson('/keluarga/anak/save', 'Keluarga', 'Simpan Data Riwayat Anak PNS', {
  id: '',
  pnsOrangId: 'string',
  pasanganId: 'string',
  nama: 'string',
  tempatLahir: 'string',
  tglLahir: 'dd-mm-yyyy',
  jenisKelamin: 'M',
  jenisAnakId: '1',
  statusHidup: '1',
  aktaKelahiran: 'string'
});

// 12. KOMPETENSI & POTENSI
addGet('/kompetensi/refkegiatan', 'Kompetensi & Potensi', 'Get List Referensi Kegiatan Penkom', [
  { name: 'limit', in: 'query', type: 'integer' },
  { name: 'offset', in: 'query', type: 'integer' }
]);
addGet('/kompetensi/refinstitusipenkom', 'Kompetensi & Potensi', 'Get List Institusi Penkom', [
  { name: 'limit', in: 'query', type: 'integer' },
  { name: 'offset', in: 'query', type: 'integer' }
]);
addPostJson('/kompetensi/refkegiataninstansi/save', 'Kompetensi & Potensi', 'Simpan Kegiatan Penkom Instansi', {
  instansiId: 'string',
  namaKegiatan: 'string',
  tahun: '2024',
  tanggalMulai: 'dd-mm-yyyy',
  tanggalSelesai: 'dd-mm-yyyy'
});
addPostJson('/kompetensi/potensi/save', 'Kompetensi & Potensi', 'Simpan Data Riwayat Potensi Asesmen', {
  pnsOrangId: 'string',
  berfikirKritis: 'string',
  intelektual: 'string',
  interpersonal: 'string',
  kesadaranDiri: 'string',
  motivasiKomitmen: 'string',
  total: 'string'
});
addPostJson('/kompetensi/kompetensi/save', 'Kompetensi & Potensi', 'Simpan Data Riwayat Kompetensi Asesmen', {
  pnsId: 'string',
  integritas: 'string',
  kerjasama: 'string',
  komunikasi: 'string',
  orientasiPadaHasil: 'string',
  pelayananPublik: 'string',
  pengembanganDiriDanOrla: 'string',
  mengelolaPerubahan: 'string',
  pengambilanKeputusan: 'string',
  perekatBangsa: 'string'
});

// 13. PENGHARGAAN
addGet('/penghargaan/id/{idRiwayatPenghargaan}', 'Penghargaan', 'Get Detail Riwayat Penghargaan by ID', [{ name: 'idRiwayatPenghargaan', in: 'path' }]);
addDelete('/penghargaan/delete/{idRiwayatPenghargaan}', 'Penghargaan', 'Hapus Riwayat Penghargaan', [{ name: 'idRiwayatPenghargaan', in: 'path' }]);
addPostJson('/penghargaan/save', 'Penghargaan', 'Simpan Riwayat Penghargaan', {
  id: '',
  pnsOrangId: 'string',
  hargaId: 'string',
  tahun: 2024,
  skNomor: 'string',
  skDate: 'dd-mm-yyyy'
});
addPostMultipart('/penghargaan/document/save', 'Penghargaan', 'Simpan Riwayat Penghargaan beserta Dokumen Sertifikat', {
  id: { type: 'string' },
  pns_orang_id: { type: 'string' },
  harga_id: { type: 'string' },
  tahun: { type: 'integer' },
  sk_nomor: { type: 'string' },
  sk_date: { type: 'string' },
  skala_harga: { type: 'string' },
  file: { type: 'string', format: 'binary', description: 'File Sertifikat Penghargaan (PDF)' }
});

// 14. SERTIFIKASI
addPostJson('/sertifikasi/save', 'Sertifikasi', 'Simpan Riwayat Sertifikasi Pegawai', {
  id: '',
  pnsOrangId: 'string',
  namaSertifikasi: 'string',
  nomorSertifikat: 'string',
  tanggalSertifikat: 'dd-mm-yyyy',
  masaBerlakuSertMulai: 'dd-mm-yyyy',
  masaBerlakuSertSelesai: 'dd-mm-yyyy'
});
addDelete('/sertifikasi/delete/{idRiwayatSertifikasi}', 'Sertifikasi', 'Hapus Riwayat Sertifikasi', [{ name: 'idRiwayatSertifikasi', in: 'path' }]);

// 15. TUGAS BELAJAR (TUBEL)
addPostJson('/tubel/save', 'Tugas Belajar', 'Simpan Riwayat Tugas Belajar Pegawai', {
  id: '',
  pnsOrangId: 'string',
  namaSekolah: 'string',
  pendidikanId: 'string',
  tglMulai: 'dd-mm-yyyy',
  tglSelesai: 'dd-mm-yyyy'
});

// 16. PENCANTUMAN GELAR & TALENTA
addGet('/partition/profesi-instansi', 'Pencantuman Gelar & Talenta', 'Get Usulan Pencantuman Gelar Profesi by NIP', [
  { name: 'nip', in: 'query' }
]);
addGet('/partition/list-pg-instansi', 'Pencantuman Gelar & Talenta', 'Get List Pencantuman Gelar ASN by NIP', [
  { name: 'nip', in: 'query' }
]);
addPostJson('/tm/talentmapping-save', 'Pencantuman Gelar & Talenta', 'Simpan Data Talent Mapping ASN', {
  pns_id: 'string',
  box: 'string',
  sumbu_x: 'string',
  sumbu_y: 'string',
  total_sumbu: 'string'
});
addGet('/tm/detail-nilai-sumbu-tm', 'Pencantuman Gelar & Talenta', 'Get Detail Nilai Sumbu Talent Mapping');

// 17. NON ASN & USULAN IDIS
addGet('/nonasn/data/{nik}', 'Non ASN & IDIS', 'Get Data JPT Non ASN by NIK', [{ name: 'nik', in: 'path' }]);
addGet('/idis/usulan-pelaporan-detail', 'Non ASN & IDIS', 'Get Usulan Pelaporan Detail IDIS', [
  { name: 'status_usulan', in: 'query' },
  { name: 'limit', in: 'query' },
  { name: 'offset', in: 'query' },
  { name: 'order_by', in: 'query' },
  { name: 'order_dir', in: 'query' }
]);
addGet('/idis/usulan-pelaporan', 'Non ASN & IDIS', 'Get List Usulan Pelaporan IDIS');

// 18. REFERENSI
addGet('/referensi/ref-unor', 'Referensi', 'Get Daftar Referensi Unor (Unit Organisasi)', [
  { name: 'limit', in: 'query', type: 'integer' },
  { name: 'offset', in: 'query', type: 'integer' }
]);

// 19. DOKUMEN & UNGGAH BERKAS
addGet('/download-dok', 'Dokumen & Unggah Berkas', 'Unduh Dokumen Berkas dari BKN (Format PDF Streaming)', [
  { name: 'filePath', in: 'query', required: true, description: 'Path file dokumen di BKN (misal: dms/... atau peremajaan/usulan/...)' }
]);
addPostMultipart('/upload-photo', 'Dokumen & Unggah Berkas', 'Upload Pas Foto Pegawai', {
  pns_id: { type: 'string', description: 'ID PNS di SIASN BKN' },
  file: { type: 'string', format: 'binary', description: 'File Foto Pegawai (JPG/PNG)' }
}, ['pns_id', 'file']);
addPostMultipart('/upload-dok', 'Dokumen & Unggah Berkas', 'Upload Dokumen Umum ke BKN', {
  id_ref_dokumen: { type: 'integer', description: 'ID Jenis Dokumen (872, 873, 879, 880, 891)' },
  file: { type: 'string', format: 'binary', description: 'File Dokumen PDF' }
}, ['id_ref_dokumen', 'file']);
addPostMultipart('/upload-dok-rw', 'Dokumen & Unggah Berkas', 'Upload Dokumen Terkait Riwayat Pegawai', {
  id_riwayat: { type: 'string', description: 'ID Riwayat yang bersangkutan' },
  id_ref_dokumen: { type: 'integer', description: 'ID Jenis Dokumen' },
  file: { type: 'string', format: 'binary', description: 'File Dokumen PDF' }
}, ['id_riwayat', 'id_ref_dokumen', 'file']);
addPostMultipart('/upload-dok-sk-kp', 'Dokumen & Unggah Berkas', 'Upload Dokumen SK Kenaikan Pangkat (KP)', {
  id_usulan: { type: 'string', description: 'ID Usulan KP' },
  no_sk: { type: 'string' },
  tgl_sk: { type: 'string', description: 'dd-mm-yyyy' },
  file: { type: 'string', format: 'binary', description: 'File SK KP (PDF)' }
}, ['id_usulan', 'no_sk', 'tgl_sk', 'file']);
addPostMultipart('/upload-dok-sk-nip', 'Dokumen & Unggah Berkas', 'Upload Dokumen SK Penetapan NIP', {
  no_peserta: { type: 'string' },
  tahun_formasi: { type: 'string' },
  no_sk: { type: 'string' },
  tgl_sk: { type: 'string' },
  tgl_ttd_sk: { type: 'string' },
  pejabat_ttd_sk: { type: 'string' },
  file: { type: 'string', format: 'binary', description: 'File SK NIP (PDF)' }
}, ['no_peserta', 'tahun_formasi', 'no_sk', 'tgl_sk', 'file']);

// 20. DASHBOARD
addDelete('/dashboard/aktivity/delete/{idAktivitas}', 'Dashboard', 'Hapus Aktivitas Harian Internal BKN', [{ name: 'idAktivitas', in: 'path' }]);
addPostJson('/dashboard/aktivity/save', 'Dashboard', 'Simpan Aktivitas Resume SIASN', {
  kegiatanId: 0,
  pnsId: 'string',
  realisasi: 0,
  sesi: 0,
  sistem: 'string',
  waktu: 'string'
});

// Tulis ke file src/docs/swagger.json
const targetDir = path.join(__dirname, '..', 'docs');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}
const targetFile = path.join(targetDir, 'swagger.json');
fs.writeFileSync(targetFile, JSON.stringify(swaggerSpec, null, 2), 'utf-8');

console.log(`✅ File Swagger berhasil dibuat: ${targetFile}`);
console.log(`Total tag: ${swaggerSpec.tags.length}`);
console.log(`Total path endpoint terdaftar: ${Object.keys(swaggerSpec.paths).length}`);
