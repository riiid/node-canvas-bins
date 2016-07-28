const pkgDir = require('pkg-dir');

exports.ROOT = pkgDir.sync();

exports.nl = () => process.stdout.write('\n');
