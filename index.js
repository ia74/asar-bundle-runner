// require('./test.asar/index.js')

const fs = require('fs');
const path = require('node:path');
const asar = require('@electron/asar');

const filename = 'test.Freedeck';

if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp');
fs.chmodSync('./tmp', 0o777);

const mods = new Map();

asar.createPackage('./asar-test', `./${filename}`).then(a => {
	asar.extractAll(`./${filename}`, `tmp/_extracted_${filename}`);
	checkExistsWithTimeout(`./tmp/_extracted_${filename}/index.js`, 1000).then(() => {
		fs.chmodSync(`./tmp/_extracted_${filename}`, 0o777);
		const robotjs = require('./tmp/_extracted_' + filename + '/index.js');
		mods.set(filename, robotjs);
		robotjs.exec();
	})
})

function checkExistsWithTimeout(filePath, timeout) {
	return new Promise(function (resolve, reject) {

			var timer = setTimeout(function () {
					watcher.close();
					reject(new Error('File did not exists and was not created during the timeout.'));
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

