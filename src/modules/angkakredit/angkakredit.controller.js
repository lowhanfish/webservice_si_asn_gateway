const bknClient = require('../../helpers/bknClient');

class AngkaKreditController {
  async getById(req, res) {
    return bknClient.forward(req, res, `/angkakredit/id/${req.params.idRiwayatAngkaKredit}`);
  }

  async save(req, res) {
    return bknClient.forward(req, res, '/angkakredit/save');
  }

  async delete(req, res) {
    return bknClient.forward(req, res, `/angkakredit/delete/${req.params.idRiwayatAngkaKredit}`);
  }

  async saveDocument(req, res) {
    return bknClient.forward(req, res, '/angkakredit/document/save');
  }
}

module.exports = new AngkaKreditController();
