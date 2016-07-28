/* eslint no-restricted-modules: 0 */
require('colors');
const Builder = require('./builder');

new Builder()
  .listImages$()
  .createContainer$()
  .startContainer$()
  .install$()
  .copy$()
  .cleanContainer$()
  .generate()
  .subscribe(() => {
  }, err => {
    console.log(err.stack.red);
  });
