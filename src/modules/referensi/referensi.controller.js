const bknClient = require('../../helpers/bknClient');

class ReferensiController {
  async getRefUnor(req, res) {
    return bknClient.forward(req, res, '/referensi/ref-unor');
  }
}

module.exports = new ReferensiController();
