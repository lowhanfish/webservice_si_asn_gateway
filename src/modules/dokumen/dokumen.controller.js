const bknClient = require('../../helpers/bknClient');

class DokumenController {
  async downloadDok(req, res) {
    return bknClient.forward(req, res, '/download-dok');
  }

  async uploadPhoto(req, res) {
    return bknClient.forward(req, res, '/upload-photo');
  }

  async uploadDok(req, res) {
    return bknClient.forward(req, res, '/upload-dok');
  }

  async uploadDokRw(req, res) {
    return bknClient.forward(req, res, '/upload-dok-rw');
  }

  async uploadDokSkKp(req, res) {
    return bknClient.forward(req, res, '/upload-dok-sk-kp');
  }

  async uploadDokSkNip(req, res) {
    return bknClient.forward(req, res, '/upload-dok-sk-nip');
  }
}

module.exports = new DokumenController();
