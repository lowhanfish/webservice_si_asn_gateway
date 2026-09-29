const bknClient = require('../../helpers/bknClient');

class CpnsController {
  async save(req, res) {
    return bknClient.forward(req, res, '/cpns/save');
  }

  async saveDocument(req, res) {
    return bknClient.forward(req, res, '/cpns/document/save');
  }

  async getDokumenPengadaan(req, res) {
    return bknClient.forward(req, res, '/pengadaan/dokumen-pengadaan');
  }

  async getListPengadaan(req, res) {
    return bknClient.forward(req, res, '/pengadaan/list-pengadaan-instansi');
  }
}

module.exports = new CpnsController();
