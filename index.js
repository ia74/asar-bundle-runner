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
	extract: (filename, isDebug) => {
		return new Promise((resolve, reject) => {
			if (!fs.existsSync('./' + abr._temporaryDir)) fs.mkdirSync('./' + abr._temporaryDir);
			fs.chmodSync(path.resolve('./' + abr._temporaryDir), 0o777);
			if (isDebug) console.log('Chmodded ' + path.resolve('./' + abr._temporaryDir) + ' to 777.')
			if (isDebug) console.log('Stripped extra slashes from filename.')
			asar.extractAll(path.join(`./${filename}`), path.resolve(`${abr._temporaryDir}/${abr._extrPrefix}${filename.replace(/\//g, '_').replace(/\\/g, '_')}`));
			if (isDebug) console.log('Extracted ' + path.join(`./${filename}`) + ' to ' + path.resolve(`${abr._temporaryDir}/${abr._extrPrefix}${filename}`) + '.')
			abr._watch(path.resolve(`./${abr._temporaryDir}/${abr._extrPrefix}${filename}/package.json`),2).then(() => {
				if (isDebug) console.log('Watched ' + path.resolve(`./${abr._temporaryDir}/${abr._extrPrefix}${filename}/package.json`) + '.')
				fs.chmodSync(path.resolve(`./${abr._temporaryDir}/${abr._extrPrefix}${filename}`), 0o777);
				if (isDebug) console.log('Chmodded ' + path.resolve(`./${abr._temporaryDir}/${abr._extrPrefix}${filename}`) + ' to 777.')
				const mainCfgFile = require(path.resolve(`./${abr._temporaryDir}/${abr._extrPrefix}${filename}/package.json`)).main;
				if (isDebug) console.log('Got main config file: ' + mainCfgFile + '.')
				const cfg = require(path.resolve(`./${abr._temporaryDir}/${abr._extrPrefix}` + filename + '/' + mainCfgFile));
				if (isDebug) console.log('Got config: ' + cfg + '.')
				const module = require(path.resolve(`./${abr._temporaryDir}/${abr._extrPrefix}${filename}/` + cfg.entrypoint));
				if (isDebug) console.log('Got module: ' + module + '.')
				abr.modules.set(filename, module);
				if (isDebug) console.log('Set module in map.')
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
