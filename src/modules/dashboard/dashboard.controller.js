const bknClient = require('../../helpers/bknClient');

class DashboardController {
  async saveAktivitas(req, res) {
    return bknClient.forward(req, res, '/dashboard/aktivity/save');
  }

  async deleteAktivitas(req, res) {
    return bknClient.forward(req, res, `/dashboard/aktivity/delete/${req.params.idAktivitas}`);
  }
}

module.exports = new DashboardController();
