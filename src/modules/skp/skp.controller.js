const bknClient = require('../../helpers/bknClient');

class SkpController {
  async getById(req, res) {
    return bknClient.forward(req, res, `/skp/id/${req.params.idRiwayatSkp}`);
  }

  async save(req, res) {
    return bknClient.forward(req, res, '/skp/save');
  }

  async save2021(req, res) {
    return bknClient.forward(req, res, '/skp/2021/save');
  }

  async getSkp22ById(req, res) {
    return bknClient.forward(req, res, `/skp22/id/${req.params.idRiwayatSkp22}`);
  }

  async saveSkp22(req, res) {
    return bknClient.forward(req, res, '/skp22/save');
  }

  async saveSkp22Document(req, res) {
    return bknClient.forward(req, res, '/skp22/document/save');
  }

  async saveKinerjaPeriodik(req, res) {
    return bknClient.forward(req, res, '/kinerjaperiodik/save');
  }

  async deleteKinerjaPeriodik(req, res) {
    return bknClient.forward(req, res, `/kinerjaperiodik/delete/${req.params.idRiwayatKinerjaPeriodik}`);
  }
}

module.exports = new SkpController();
