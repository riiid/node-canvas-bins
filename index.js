const data = require('./data/bin.json');
const fs = require('fs');
const path = require('path');

exports.install = path => {
  const p = path || process.cwd();
  data.binaries.forEach(bin => {
    const p = path.join(p, bin.filename);
    fs.writeFileSync(p, new Buffer(bin.content, 'base64'));
  });
};

exports.clean = path => {
  const p = path || process.cwd();
  data.binaries.forEach(bin => {
    const p = path.join(p, bin.filename);
    fs.unlinkSync(p);
  });
};
