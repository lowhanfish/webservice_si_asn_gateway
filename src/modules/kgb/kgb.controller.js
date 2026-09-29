const bknClient = require('../../helpers/bknClient');

class KgbController {
  async save(req, res) {
    return bknClient.forward(req, res, '/kgb/save');
  }

  async delete(req, res) {
    return bknClient.forward(req, res, `/kgb/delete/${req.params.idRiwayatKgb}`);
  }
}

module.exports = new KgbController();
