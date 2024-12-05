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
	/**
	 * Sets the temporary dir where the .asar extracted files will be stored.
	 * @param {String} dir The directory to set.
	 */
	setTemporaryDir: (dir) => {
		abr._temporaryDir = dir;
	},
	/**
	 * Sets the prefix for the extracted files.
	 * @example _e_ -> _e_filename
	 * @param {String} prefix The prefix to set.
	 */
	setExtractionPrefix: (prefix) => {
		abr._extrPrefix = prefix;
	},
	extractStep: 0,
	modules: new Map(),
	/**
	 * Extracts a .asar file and load the module into ABR cache.
	 * @param {*} filename The .asar file to extract. Must be a path relative to the current working directory.
	 * @param {*} isDebug Whether or not to log each step as it happens.
	 * @returns Promise(filename)
	 */
	extract: (filename, isDebug = false) => {
		return new Promise((resolve, reject) => {
			abr.extractStep = 0;
			if (!fs.existsSync('./' + abr._temporaryDir)) fs.mkdirSync('./' + abr._temporaryDir);
			fs.chmodSync(path.resolve('./' + abr._temporaryDir), 0o777);
			abr.extractStep++;
			if (isDebug) console.log('Chmodded ' + path.resolve('./' + abr._temporaryDir) + ' to 777.')
			asar.extractAll(path.resolve(`./${filename}`), path.resolve(`${abr._temporaryDir}/${abr._extrPrefix}${filename.replace(/\//g, '_').replace(/\\/g, '_')}`));
			abr.extractStep++;
			if (isDebug) console.log('Extracted ' + path.resolve(`./${filename}`) + ' to ' + path.resolve(`${abr._temporaryDir}`, `${abr._extrPrefix}${filename.replace(/\//g, '_').replace(/\\/g, '_')}`) + '.')
			filename = filename.replace(/\//g, '_').replace(/\\/g, '_')
			if (isDebug) console.log('Stripped extra slashes from filename.')
			abr.extractStep++;
			abr._watch(path.resolve(`./${abr._temporaryDir}/${abr._extrPrefix}${filename}/package.json`), 2).then(() => {
				try {
					abr.extractStep++;
					if (isDebug) console.log('Watched ' + path.resolve(`./${abr._temporaryDir}/${abr._extrPrefix}${filename}/package.json`) + '.')
					fs.chmodSync(path.resolve(`./${abr._temporaryDir}/${abr._extrPrefix}${filename}`), 0o777);
					abr.extractStep++;
					if (isDebug) console.log('Chmodded ' + path.resolve(`./${abr._temporaryDir}/${abr._extrPrefix}${filename}`) + ' to 777.')
					const mainCfgFile = require(path.resolve(`./${abr._temporaryDir}/${abr._extrPrefix}${filename}/package.json`)).main;
					abr.extractStep++;
					if (isDebug) console.log('Got main config file: ' + mainCfgFile + '.')
					const cfg = require(path.resolve(`./${abr._temporaryDir}/${abr._extrPrefix}` + filename + '/' + mainCfgFile));
					abr.extractStep++;
					if (isDebug) console.log('Got config: ' + cfg + '.')
					const module = require(path.resolve(`./${abr._temporaryDir}/${abr._extrPrefix}${filename}/` + cfg.entrypoint));
					abr.extractStep++;
					if (isDebug) console.log('Got module: ' + module + '.')
					abr.modules.set(filename, module);
					abr.extractStep++;
					if (isDebug) console.log('Set module in map.')
					abr.extractStep++;
				} catch (err) {
					console.log('Extraction failed on step', abr.extractStep);
					console.error(err);
					reject(err);
				}
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
