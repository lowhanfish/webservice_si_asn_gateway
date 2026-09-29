const bknClient = require('../../helpers/bknClient');

class SertifikasiController {
  async save(req, res) {
    return bknClient.forward(req, res, '/sertifikasi/save');
  }

  async delete(req, res) {
    return bknClient.forward(req, res, `/sertifikasi/delete/${req.params.idRiwayatSertifikasi}`);
  }
}

module.exports = new SertifikasiController();
