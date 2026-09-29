const bknClient = require('../../helpers/bknClient');

class DiklatController {
  async saveDiklatDocument(req, res) {
    return bknClient.forward(req, res, '/diklat/document/save');
  }

  async getKursusById(req, res) {
    return bknClient.forward(req, res, `/kursus/id/${req.params.idRiwayatKursus}`);
  }

  async saveKursus(req, res) {
    return bknClient.forward(req, res, '/kursus/save');
  }

  async deleteKursus(req, res) {
    return bknClient.forward(req, res, `/kursus/delete/${req.params.idRiwayatKursus}`);
  }

  async saveKursusDocument(req, res) {
    return bknClient.forward(req, res, '/kursus/document/save');
  }
}

module.exports = new DiklatController();
