# node-canvas-bins

prebuilt [node-canvas](https://github.com/Automattic/node-canvas) binary.

## why?

When you create [AWS lambda](https://aws.amazon.com/lambda/) function that depends on [node-canvas](https://github.com/Automattic/node-canvas), It's not that simple.
You can't install [external dependencies](https://github.com/Automattic/node-canvas/wiki/Installation---Ubuntu-and-other-Debian-based-systems) on lambda runtime. You have to prebuilt them before deploy your lambda function.
This package help this process. It has `base64` encoded prebuilt node-canvas binaries and it's dependencies in [bin.json](https://github.com/riiid/node-canvas-bins/blob/master/data/bin.json) file. `bin.json` will be decoded on [install](https://github.com/riiid/node-canvas-bins/blob/master/bin/install) script.
Invoke this install script build or deploy process, (such as [apex hooks](http://apex.run/#function-hooks)) you can easily including node-canvas in your lambda function.

## install

```
$ npm install riiid/node-canvas-bins
```

## examples

### use in app

```
import {install} from 'node-canvas-bins';

install('/YOUR/DESIRED/PATH');
```

### use with [apex](http://apex.run/)

exclude `canvas` module on `webpack.config.js`.

```
module.exports = {
  // ...
  externals: {
    '../build/Release/canvas': 'canvas'
  },
  // ...
}
```

> see [apex webpack example](https://github.com/apex/apex/tree/master/_examples/babel-webpack) to use apex with webpack.

use [apex hooks](http://apex.run/#function-hooks) to invoke [install](https://github.com/riiid/node-canvas-bins/blob/master/bin/install), [clean](https://github.com/riiid/node-canvas-bins/blob/master/bin/clean) script.

```
{
  "hooks": {
    "build": "../../node_modules/.bin/ncb-install && ../../node_modules/.bin/webpack --config ../../webpack.config.js",
    "clean": "../../node_modules/.bin/ncb-clean && ../../node_modules/.bin/rimraf dist"
  }
}
```

> see [vega-renderer](https://github.com/riiid/vega-renderer/blob/master/webpack.config.js) for complete usecase.

## development

### prerequisites

[docker](https://www.docker.com/) (>= 1.11) on your system.

### build

to build new `data/bin.json`,

```
$ git clone riiid/node-canvas-bins
$ cd node-canvas-bins
$ npm install
$ npm run build
```

```
$ npm run build -- [--version=<node-canvas-version>]
```

```
$ npm run lint
```
