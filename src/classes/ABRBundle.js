const path = require("node:path");
const fs = require("fs/promises");
const timers = require("timers/promises");
const ABRExtractor = require("./ABRExtractor");

const waitForFile = async (
  filePath,
  {timeout = 30_000, delay = 200} = {}
) => {
  const tid = setTimeout(() => {
    const msg = `Timeout of ${timeout} ms exceeded waiting for ${filePath}`;
    throw Error(msg);
  }, timeout);

  for (;;) {
    try {
      const file = await fs.readFile(filePath, {encoding: "utf-8"});
      clearTimeout(tid);
      return file;
    }
    catch (err) {}

    await timers.setTimeout(delay);
  }
};

module.exports = class ABRBundle {
  _filename;
  filename;
  e_prefix = "_e_";
  e_dir = "tmp";
  e_path = "";
  logMode = "verbose";
  extracted = false;
  configuration = {};
  _log(msg, mode=this.logMode) {
    if(this.logMode === "quiet") return;
    if(this.logMode === "verbose" || mode === "verbose") {
      console.log(msg);
    }
  }
  makeQuiet() {this.logMode = "quiet";}
  makeVerbose() {this.logMode = "verbose";} 
  constructor(filename) {
    this._filename = filename;
    this.filename = filename;
    this.e_path = path.resolve(this.e_dir, this.e_prefix + this.filename);
  }
  async extract() {
    const bundle = new ABRExtractor(this.filename);
    await bundle.extract(this.e_path);
    this.filename = this.filename.replace(/\//g, '_').replace(/\\/g, '_');
    const pkg = await waitForFile(path.resolve(this.e_path, "package.json"));
    const main = JSON.parse(pkg).main;
    const cfg = require(path.resolve(this.e_path, main));
    this.configuration = cfg;
    this.extracted = true;
    return cfg;
  }
  async run() {
    if(!this.extracted) {
      this._log("Bundle not extracted. Please use .extract()", "verbose");
      return;
    }
    const entrypoint = this.configuration.entrypoint;
    const module = require(path.resolve(this.e_path, entrypoint));
    return module.exec();
  }
}