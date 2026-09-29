const bknClient = require('../../helpers/bknClient');

class JabatanController {
  async getById(req, res) {
    return bknClient.forward(req, res, `/jabatan/id/${req.params.idRiwayatJabatan}`);
  }

  async getByNip(req, res) {
    return bknClient.forward(req, res, `/jabatan/pns/${req.params.nipBaru}`);
  }

  async save(req, res) {
    return bknClient.forward(req, res, '/jabatan/save');
  }

  async saveUnorJabatan(req, res) {
    return bknClient.forward(req, res, '/jabatan/unorjabatan/save');
  }

  async delete(req, res) {
    return bknClient.forward(req, res, `/jabatan/delete/${req.params.idRiwayatJabatan}`);
  }

  async saveDocument(req, res) {
    return bknClient.forward(req, res, '/jabatan/unorjabatan/document/save');
  }
}

module.exports = new JabatanController();
