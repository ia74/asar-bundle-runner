const AsarBundleRunner = require('./index');
AsarBundleRunner.extract('plugins/test.asar', true).then(AsarBundleRunner.run).then(dat => {
	console.log(dat)
})