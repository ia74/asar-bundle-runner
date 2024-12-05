const asar = require("@electron/asar");

module.exports = class ABRExtractor {
  _path;
  to = "tmp";
  constructor(path) {
    this._path = path;
  }
  async extract(to = this.to) {
    const asarFile = asar.extractAll(this._path, to);
    return asarFile;
  }
}