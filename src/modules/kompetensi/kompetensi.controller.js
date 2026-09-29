const bknClient = require('../../helpers/bknClient');

class KompetensiController {
  async getRefKegiatan(req, res) {
    return bknClient.forward(req, res, '/kompetensi/refkegiatan');
  }

  async getRefInstitusi(req, res) {
    return bknClient.forward(req, res, '/kompetensi/refinstitusipenkom');
  }

  async saveKegiatanInstansi(req, res) {
    return bknClient.forward(req, res, '/kompetensi/refkegiataninstansi/save');
  }

  async savePotensi(req, res) {
    return bknClient.forward(req, res, '/kompetensi/potensi/save');
  }

  async saveKompetensi(req, res) {
    return bknClient.forward(req, res, '/kompetensi/kompetensi/save');
  }
}

module.exports = new KompetensiController();
