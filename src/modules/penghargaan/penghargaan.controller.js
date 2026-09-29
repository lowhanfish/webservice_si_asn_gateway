const bknClient = require('../../helpers/bknClient');

class PenghargaanController {
  async getById(req, res) {
    return bknClient.forward(req, res, `/penghargaan/id/${req.params.idRiwayatPenghargaan}`);
  }

  async save(req, res) {
    return bknClient.forward(req, res, '/penghargaan/save');
  }

  async delete(req, res) {
    return bknClient.forward(req, res, `/penghargaan/delete/${req.params.idRiwayatPenghargaan}`);
  }

  async saveDocument(req, res) {
    return bknClient.forward(req, res, '/penghargaan/document/save');
  }
}

module.exports = new PenghargaanController();
