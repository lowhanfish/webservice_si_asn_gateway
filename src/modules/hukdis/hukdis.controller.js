const bknClient = require('../../helpers/bknClient');

class HukdisController {
  async getById(req, res) {
    return bknClient.forward(req, res, `/hukdis/id/${req.params.idRiwayatHukdis}`);
  }

  async save(req, res) {
    return bknClient.forward(req, res, '/hukdis/save');
  }
}

module.exports = new HukdisController();
