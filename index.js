// require('./test.asar/index.js')

const fs = require('fs');
const path = require('node:path');
const asar = require('@electron/asar');

const filename = 'test.Freedeck';
const temporaryDirectoryName = 'tmp';
const extractedPrefix = '_extracted_';

if (!fs.existsSync('./' + temporaryDirectoryName)) fs.mkdirSync('./' + temporaryDirectoryName);
fs.chmodSync('./' + temporaryDirectoryName, 0o777);

const mods = new Map();

asar.createPackage('./asar-test', `./${filename}`).then(a => {
	asar.extractAll(`./${filename}`, `${temporaryDirectoryName}/${extractedPrefix}${filename}`);
	checkExistsWithTimeout(`./${temporaryDirectoryName}/${extractedPrefix}${filename}/package.json`,2).then(() => {
		fs.chmodSync(`./${temporaryDirectoryName}/${extractedPrefix}${filename}`, 0o777);
		const mainCfgFile = require(`./${temporaryDirectoryName}/${extractedPrefix}${filename}/package.json`).main;
		const cfg = require(`./${temporaryDirectoryName}/${extractedPrefix}` + filename + '/' + mainCfgFile);
		const module = require(`./${temporaryDirectoryName}/${extractedPrefix}${filename}/` + cfg.entrypoint);
		mods.set(filename, module);
		module.exec();
	})
})

function checkExistsWithTimeout(filePath, timeout) {
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
}

