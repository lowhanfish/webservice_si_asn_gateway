const bknClient = require('../../helpers/bknClient');

class TalentaController {
  async getProfesiInstansi(req, res) {
    return bknClient.forward(req, res, '/partition/profesi-instansi');
  }

  async getListPgInstansi(req, res) {
    return bknClient.forward(req, res, '/partition/list-pg-instansi');
  }

  async saveTalentMapping(req, res) {
    return bknClient.forward(req, res, '/tm/talentmapping-save');
  }

  async getDetailNilaiSumbuTm(req, res) {
    return bknClient.forward(req, res, '/tm/detail-nilai-sumbu-tm');
  }
}

module.exports = new TalentaController();
