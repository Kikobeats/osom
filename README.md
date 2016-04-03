# ardent

![Last version](https://img.shields.io/github/tag/Kikobeats/ardent.svg?style=flat-square)
[![Build Status](http://img.shields.io/travis/Kikobeats/ardent/master.svg?style=flat-square)](https://travis-ci.org/Kikobeats/ardent)
[![Dependency status](http://img.shields.io/david/Kikobeats/ardent.svg?style=flat-square)](https://david-dm.org/Kikobeats/ardent)
[![Dev Dependencies Status](http://img.shields.io/david/dev/Kikobeats/ardent.svg?style=flat-square)](https://david-dm.org/Kikobeats/ardent#info=devDependencies)
[![NPM Status](http://img.shields.io/npm/dm/ardent.svg?style=flat-square)](https://www.npmjs.org/package/ardent)
[![Donate](https://img.shields.io/badge/donate-paypal-blue.svg?style=flat-square)](https://paypal.me/Kikobeats)

> Fancy Object Schema Modeling. Inspired in [Mongoose Schema](https://github.com/Automattic/mongoose#defining-a-model) but out of the box.

## Install

```bash
$ npm install ardent --save
```

If you want to use in the browser (powered by [Browserify](http://browserify.org/)):

```bash
$ bower install ardent --save
```

and later link in your HTML:

```html
<script src="bower_components/ardent/dist/ardent.js"></script>
```
## Usage

```js
var Ardent = require('ardent')

function trim (str) {
  return str.trim()
}

// setup your schema
var schema = {
  age: {
    type: String,
    default: '23',
    filter: [trim]
  }
}

// creating schema validation
var ardent = Ardent(schema)

// schema factory
ardent({age: '  23  '}).should.be.eql({age: '23'})
```

## API

### ardent(schema, [options])

#### schema

*Required*<br>
Type: `object`

Created a Factory for validate a schema based in a set of rules.

Rules are setup following two approach

##### Basic

Just provide `key/value` pair per rule, where `key` is the name of the rule and `value` the type casting result:

```js
var basicSchema = {
  age: Number
}
```

##### Advanced

The *basic* mode is a simplification of the *advanced* mode. 

While in *basic* mode only is possible setup `type` casting, in *advanced* mode you can setup more things providing a configurable `object`.

The following keys setup your rule:

- `type`: as in *basic* mode, it specifies the type casting of the output value.
- `default`: whatever default value that you can set if `nill` value as input is provided.
- `filter`: an `Array` collection of data transforms as pipeline of methods to apply for the input value.

```js
function trim (str) {
  return str.trim()
}
    
var advancedSchema = {
  age: {
    type: String,
    default: '23',
    filter: [trim]
  }
}
```

#### options

Type: `object`
Default: `soon`

*soon*

## License

MIT © [Kiko Beats](http://kikobeats.com)
