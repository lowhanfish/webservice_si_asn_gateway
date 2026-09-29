const bknClient = require('../../helpers/bknClient');

class KeluargaController {
  async savePasangan(req, res) {
    return bknClient.forward(req, res, '/keluarga/pasangan/save');
  }

  async saveAnak(req, res) {
    return bknClient.forward(req, res, '/keluarga/anak/save');
  }
}

module.exports = new KeluargaController();
