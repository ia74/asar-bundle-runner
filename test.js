const AsarBundleRunner = require('./index');

AsarBundleRunner.extract('test.Freedeck').then(AsarBundleRunner.run)