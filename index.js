// require('./test.asar/index.js')

const fs = require('fs');
const path = require('node:path');
const asar = require('@electron/asar');

const AsarBundleRunner = {
	_temporaryDir: 'tmp',
	_extrPrefix: '_e_',
	_watch: (filePath, timeout) => {
		return new Promise(function (resolve, reject) {
	
				var timer = setTimeout(function () {
						watcher.close();
						checkExistsWithTimeout(filePath, timeout).then(resolve, reject);
				}, timeout);
	
				fs.access(filePath, fs.constants.R_OK, function (err) {
						if (!err) {
								clearTimeout(timer);
								watcher.close();
								resolve();
						}
				});
	
				var dir = path.dirname(filePath);
				var basename = path.basename(filePath);
				var watcher = fs.watch(dir, function (eventType, filename) {
						if (eventType === 'rename' && filename === basename) {
								clearTimeout(timer);
								watcher.close();
								resolve();
						}
				});
		});
	},
	modules: new Map(),
	extract: (filename) => {
		if (!fs.existsSync('./' + this._temporaryDir)) fs.mkdirSync('./' + this._temporaryDir);
		fs.chmodSync('./' + this._temporaryDir, 0o777);
		asar.extractAll(`./${filename}`, `${this._temporaryDir}/${this._extrPrefix}${filename}`);
		this._watch(`./${this._temporaryDir}/${this._extrPrefix}${filename}/package.json`,2).then(() => {
			fs.chmodSync(`./${this._temporaryDir}/${this._extrPrefix}${filename}`, 0o777);
			const mainCfgFile = require(`./${this._temporaryDir}/${this._extrPrefix}${filename}/package.json`).main;
			const cfg = require(`./${this._temporaryDir}/${this._extrPrefix}` + filename + '/' + mainCfgFile);
			const module = require(`./${this._temporaryDir}/${this._extrPrefix}${filename}/` + cfg.entrypoint);
			this.modules.set(filename, module);
		})
	}
};
module.exports = AsarBundleRunner;
