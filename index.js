const fs = require('fs');
const path = require('node:path');
const asar = require('@electron/asar');

const abr = {
	_temporaryDir: 'tmp',
	_extrPrefix: '_e_',
	_watch: (filePath, timeout) => {
		return new Promise(function (resolve, reject) {
	
				var timer = setTimeout(function () {
						watcher.close();
						abr._watch(filePath, timeout).then(resolve, reject);
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
		return new Promise((resolve, reject) => {
			if (!fs.existsSync('./' + abr._temporaryDir)) fs.mkdirSync('./' + abr._temporaryDir);
			fs.chmodSync(path.resolve('./' + abr._temporaryDir), 0o777);
			asar.extractAll(path.join(`./${filename}`), path.resolve(`${abr._temporaryDir}/${abr._extrPrefix}${filename}`));
			abr._watch(path.resolve(`./${abr._temporaryDir}/${abr._extrPrefix}${filename}/package.json`),2).then(() => {
				fs.chmodSync(path.resolve(`./${abr._temporaryDir}/${abr._extrPrefix}${filename}`), 0o777);
				const mainCfgFile = require(path.resolve(`./${abr._temporaryDir}/${abr._extrPrefix}${filename}/package.json`)).main;
				const cfg = require(path.resolve(`./${abr._temporaryDir}/${abr._extrPrefix}` + filename + '/' + mainCfgFile));
				const module = require(path.resolve(`./${abr._temporaryDir}/${abr._extrPrefix}${filename}/` + cfg.entrypoint));
				abr.modules.set(filename, module);
				resolve(filename);
			})
		})
	},
	run: (filename) => {
		return new Promise((resolve, reject) => {
			const module = abr.modules.get(filename);
			if (module) {
				resolve(module.exec());
			} else {
				reject('Module not found.');
			}
		})
	}
};
module.exports = abr;
