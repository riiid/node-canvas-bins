const data = require('./data/bin.json');
const fs = require('fs');
const path = require('path');

exports.install = _path => {
  const p = _path || process.cwd();
  data.binaries.forEach(bin => {
    fs.writeFileSync(
      path.join(p, bin.filename),
      new Buffer(bin.content, 'base64')
    );
  });
};

exports.clean = _path => {
  const p = _path || process.cwd();
  data.binaries.forEach(bin => {
    fs.unlinkSync(path.join(p, bin.filename));
  });
};
