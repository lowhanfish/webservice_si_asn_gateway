const bknClient = require('../../helpers/bknClient');

class NonAsnController {
  async getByNik(req, res) {
    return bknClient.forward(req, res, `/nonasn/data/${req.params.nik}`);
  }

  async getUsulanPelaporanDetail(req, res) {
    return bknClient.forward(req, res, '/idis/usulan-pelaporan-detail');
  }

  async getUsulanPelaporan(req, res) {
    return bknClient.forward(req, res, '/idis/usulan-pelaporan');
  }
}

module.exports = new NonAsnController();
