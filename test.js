const AsarBundleRunner = require('./index');
AsarBundleRunner.extract('test.asar').then(AsarBundleRunner.run).then(dat => {
	console.log(dat)
})