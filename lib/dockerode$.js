const Rx = require('rx');
const RxN = require('rx-node');

const Docker = require('dockerode');
const Container = require('dockerode/lib/container');
const Exec = require('dockerode/lib/exec');

const fnc = Rx.Observable.fromNodeCallback;
const slice = Array.prototype.slice;

Docker.prototype.pull$ = function() {
  return fnc(this.pull, this).apply(this, slice.call(arguments))
    .flatMap(stream => RxN.fromStream(stream, 'end'))
    .last();
};

Docker.prototype.createContainer$ = function() {
  return fnc(this.createContainer, this).apply(this, slice.call(arguments));
};

Docker.prototype.listImages$ = function() {
  return fnc(this.listImages, this).apply(this, slice.call(arguments));
};

Container.prototype.start$ = function() {
  return fnc(this.start, this).apply(this, slice.call(arguments));
};

Container.prototype.exec$ = function() {
  return fnc(this.exec, this).apply(this, slice.call(arguments))
    .flatMap(exec => exec.start$());
};

Container.prototype.stop$ = function() {
  return fnc(this.stop, this).apply(this, slice.call(arguments));
};

Container.prototype.remove$ = function() {
  return fnc(this.remove, this).apply(this, slice.call(arguments));
};

Container.prototype.infoArchive$ = function() {
  return fnc(this.infoArchive, this).apply(this, slice.call(arguments));
};

Container.prototype.getArchive$ = function() {
  return fnc(this.getArchive, this).apply(this, slice.call(arguments));
};

Exec.prototype.start$ = function() {
  return fnc(this.start, this).apply(this, slice.call(arguments))
    .flatMap(stream => RxN.fromStream(stream, 'end'))
    .last();
};

module.exports = Docker;
