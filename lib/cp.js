const Rx = require('rx');
const tar = require('tar');
const P = require('path');
const U = require('./utils');

const TARGETS = [
  '/usr/lib/x86_64-linux-gnu/libdatrie.so.1',
  '/usr/lib/x86_64-linux-gnu/libgif.so.4',
  '/usr/lib/x86_64-linux-gnu/libgraphite2.so.3',
  '/usr/lib/x86_64-linux-gnu/libharfbuzz.so.0',
  '/usr/lib/x86_64-linux-gnu/libjpeg.so.62',
  '/usr/lib/x86_64-linux-gnu/libpango-1.0.so.0',
  '/usr/lib/x86_64-linux-gnu/libpangocairo-1.0.so.0',
  '/usr/lib/x86_64-linux-gnu/libpangoft2-1.0.so.0',
  '/usr/lib/x86_64-linux-gnu/libpangoxft-1.0.so.0',
  '/usr/lib/x86_64-linux-gnu/libpixman-1.so.0',
  '/usr/lib/x86_64-linux-gnu/libpng12.so.0',
  '/usr/lib/x86_64-linux-gnu/libthai.so.0',
  '/opt/node/node_modules/canvas/build/Release/canvas.node',
  '/opt/node/node_modules/canvas/package.json'
];

const extract = tarStream => {
  return Rx.Observable.create(observer => {
    const e = tar.Extract({path: P.join(U.ROOT, 'build')})
      .on('error', err => observer.onError(err))
      .on('end', () => {
        observer.onNext();
        observer.onCompleted();
      });
    tarStream.pipe(e);
  });
};

module.exports = container => {
  return Rx.Observable.from(TARGETS)
    .concatMap(target => {
      return container.infoArchive$({path: target})
        .map(result => {
          const stat = result.headers['x-docker-container-path-stat'];
          const parse = JSON.parse(new Buffer(stat, 'base64').toString());
          return Object.assign(parse, {target});
        });
    })
    .flatMap(stat => {
      const path = stat.linkTarget === '' ? stat.target : stat.linkTarget;
      return container.getArchive$({path})
        .flatMap(result => extract(result))
        .map(() => stat);
    })
    .toArray();
};
