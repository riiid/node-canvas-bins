'use strict';

const Rx = require('rx');
const P = require('path');
const _ = require('lodash');
const fs = require('fs');
const Docker = require('./dockerode$');
const cp = require('./cp');
const U = require('./utils');
const w = process.stdout.write.bind(process.stdout);

const OK = () => console.log('OK'.green);
const FAIL = () => console.log('FAIL'.red);

class Builder {
  constructor(dockerOpts, imageName, canvasVersion) {
    const opts = dockerOpts || {socketPath: '/var/run/docker.sock'};

    this.docker = new Docker(opts);
    this.imageName = imageName || 'geekduck/node-canvas';
    this.canvasVersion = canvasVersion || '1.4.*';
    this.$ = Rx.Observable.just()
      .tap(() => this.banner());
  }

  banner() {
  }

  listImages$() {
    this.$ = this.$
      .tap(() => w(`Find image ${this.imageName.grey} locally... `))
      .flatMap(() => this.docker.listImages$())
      .flatMap(images => {
        const hasImage = _.chain(images)
          .map(image => image.RepoTags)
          .flatten()
          .some(tag => tag === `${this.imageName}:latest`)
          .value();

        if (hasImage) {
          OK();
          return Rx.Observable.return();
        }

        FAIL();
        w(`Pulling from ${this.imageName.grey} repository... `);
        return this.docker.pull$(this.imageName).tap(OK);
      })
      .tapOnError(FAIL);
    return this;
  }

  createContainer$() {
    this.$ = this.$
      .tap(() => w('Create container... '))
      .flatMap(() => this.docker.createContainer$({
        Image: this.imageName,
        AttachStdin: false,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true
      }))
      .tap(container => {
        this.container = container;
        OK();
      })
      .tapOnError(FAIL);
    return this;
  }

  startContainer$() {
    this.$ = this.$
      .tap(() => {
        w(`Start container ${this.container.id.slice(0, 6).grey}... `);
      })
      .flatMap(() => this.container.start$())
      .tap(OK);
    return this;
  }

  install$() {
    this.$ = this.$
      .tap(() => {
        const target = `node-canvas@${this.canvasVersion}`.grey;
        w(`Install ${target} on container... `);
      })
      .flatMap(() => this.container.exec$({
        Cmd: ['npm', 'install', `canvas@${this.canvasVersion}`],
        AttachStdout: true,
        AttachStderr: true,
        Tty: false
      }))
      .tap(OK)
      .tapOnError(FAIL);
    return this;
  }

  copy$() {
    this.$ = this.$
      .tap(() => w(`Copy ${'canvas.node'.grey} to ${'build/'.grey}... `))
      .flatMap(() => cp(this.container))
      .tap(files => {
        this.files = files;
        OK();
      });
    return this;
  }

  cleanContainer$() {
    this.$ = this.$
      .tap(() => w(`Clean container ${this.container.id.slice(0, 6).grey}... `))
      .flatMap(() => this.container.stop$())
      .flatMap(() => this.container.remove$())
      .tap(() => {
        this.container = null;
        OK();
      })
      .tapOnError(FAIL);
    return this;
  }

  generate() {
    this.$ = this.$.tap(() => {
      const binPath = P.join(U.ROOT, 'build');
      const version = JSON.parse(
        fs.readFileSync(P.join(binPath, 'package.json'))
      ).version;
      const binaries = this.files
        .filter(file => file.name !== 'package.json')
        .map(file => {
          const name = file.linkTarget === '' ?
            file.name :
            P.basename(file.linkTarget);
          const content = fs.readFileSync(P.join(binPath, name), 'base64');
          return {filename: file.name, content};
        });

      fs.writeFileSync(P.join(binPath, 'bin.json'), JSON.stringify({
        canvas: {version},
        binaries
      }, null, 2));
      console.log(`Generate ${'build/bin.json'.grey}`);
    })
    .tapOnError(FAIL);
    return this;
  }

  subscribe() {
    this.$ = this.$.tap(() => U.nl());
    return this.$
      .subscribe.apply(this.$, Array.prototype.slice.call(arguments));
  }
}

module.exports = Builder;
