const bknClient = require('../../helpers/bknClient');

class ImutController {
  async getListUsulan(req, res) {
    return bknClient.forward(req, res, '/imut/simpeg/usulan/list');
  }
}

module.exports = new ImutController();
