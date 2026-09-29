const bknClient = require('../../helpers/bknClient');

class PnsController {
  async getDataUtama(req, res) {
    return bknClient.forward(req, res, `/pns/data-utama/${req.params.nipBaru}`);
  }

  async getDataAnak(req, res) {
    return bknClient.forward(req, res, `/pns/data-anak/${req.params.nipBaru}`);
  }

  async getDataPasangan(req, res) {
    return bknClient.forward(req, res, `/pns/data-pasangan/${req.params.nipBaru}`);
  }

  async getRwJabatan(req, res) {
    return bknClient.forward(req, res, `/pns/rw-jabatan/${req.params.nipBaru}`);
  }

  async getRwGolongan(req, res) {
    return bknClient.forward(req, res, `/pns/rw-golongan/${req.params.nipBaru}`);
  }

  async getRwPendidikan(req, res) {
    return bknClient.forward(req, res, `/pns/rw-pendidikan/${req.params.nipBaru}`);
  }

  async getRwDiklat(req, res) {
    return bknClient.forward(req, res, `/pns/rw-diklat/${req.params.nipBaru}`);
  }

  async getRwKursus(req, res) {
    return bknClient.forward(req, res, `/pns/rw-kursus/${req.params.nipBaru}`);
  }

  async getRwHukdis(req, res) {
    return bknClient.forward(req, res, `/pns/rw-hukdis/${req.params.nipBaru}`);
  }

  async getRwSkp(req, res) {
    return bknClient.forward(req, res, `/pns/rw-skp/${req.params.nipBaru}`);
  }

  async getRwSkp22(req, res) {
    return bknClient.forward(req, res, `/pns/rw-skp22/${req.params.nipBaru}`);
  }

  async getRwKinerjaPeriodik(req, res) {
    return bknClient.forward(req, res, `/pns/rw-kinerjaperiodik/${req.params.nipBaru}`);
  }

  async getRwAngkaKredit(req, res) {
    return bknClient.forward(req, res, `/pns/rw-angkakredit/${req.params.nipBaru}`);
  }

  async getRwCltn(req, res) {
    return bknClient.forward(req, res, `/pns/rw-cltn/${req.params.nipBaru}`);
  }

  async getRwKontrak(req, res) {
    return bknClient.forward(req, res, `/pns/rw-kontrak/${req.params.nipBaru}`);
  }

  async getRwPotensi(req, res) {
    return bknClient.forward(req, res, `/pns/rw-potensi/${req.params.nipBaru}`);
  }

  async getRwKompetensi(req, res) {
    return bknClient.forward(req, res, `/pns/rw-kompetensi/${req.params.nipBaru}`);
  }

  async getRwDp3(req, res) {
    return bknClient.forward(req, res, `/pns/rw-dp3/${req.params.nipBaru}`);
  }

  async getRwSertifikasi(req, res) {
    return bknClient.forward(req, res, `/pns/rw-sertifikasi/${req.params.nipBaru}`);
  }

  async getRwMasaKerja(req, res) {
    return bknClient.forward(req, res, `/pns/rw-masakerja/${req.params.nipBaru}`);
  }

  async getRwKgb(req, res) {
    return bknClient.forward(req, res, `/pns/rw-kgb/${req.params.nipBaru}`);
  }

  async getRwPemberhentian(req, res) {
    return bknClient.forward(req, res, `/pns/rw-pemberhentian/${req.params.nipBaru}`);
  }

  async getRwTubel(req, res) {
    return bknClient.forward(req, res, `/pns/rw-tubel/${req.params.nipBaru}`);
  }

  async getRwPenghargaan(req, res) {
    return bknClient.forward(req, res, `/pns/rw-penghargaan/${req.params.nipBaru}`);
  }

  async getRwPindahInstansi(req, res) {
    return bknClient.forward(req, res, `/pns/rw-pindahinstansi/${req.params.nipBaru}`);
  }

  async getRwPnsUnor(req, res) {
    return bknClient.forward(req, res, `/pns/rw-pnsunor/${req.params.nipBaru}`);
  }

  async getRwPwk(req, res) {
    return bknClient.forward(req, res, `/pns/rw-pwk/${req.params.nipBaru}`);
  }

  async getNilaiIpAsn(req, res) {
    return bknClient.forward(req, res, `/pns/nilaiipasn/${req.params.nipBaru}`);
  }

  async getListPensiunByNip(req, res) {
    return bknClient.forward(req, res, '/pns/list-pensiun-instansibynip');
  }

  async getListPensiunInstansi(req, res) {
    return bknClient.forward(req, res, '/pns/list-pensiun-instansi');
  }

  async getKpInstansiById(req, res) {
    return bknClient.forward(req, res, '/pns/kp-instansi-byId');
  }

  async getListKpInstansi(req, res) {
    return bknClient.forward(req, res, '/pns/list-kp-instansi');
  }
}

module.exports = new PnsController();
