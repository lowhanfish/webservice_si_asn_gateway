const bknClient = require('../../helpers/bknClient');

class TubelController {
  async save(req, res) {
    return bknClient.forward(req, res, '/tubel/save');
  }
}

module.exports = new TubelController();
