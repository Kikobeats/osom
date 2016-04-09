# osom

![Last version](https://img.shields.io/github/tag/Kikobeats/osom.svg?style=flat-square)
[![Build Status](http://img.shields.io/travis/Kikobeats/osom/master.svg?style=flat-square)](https://travis-ci.org/Kikobeats/osom)
[![Dependency status](http://img.shields.io/david/Kikobeats/osom.svg?style=flat-square)](https://david-dm.org/Kikobeats/osom)
[![Dev Dependencies Status](http://img.shields.io/david/dev/Kikobeats/osom.svg?style=flat-square)](https://david-dm.org/Kikobeats/osom#info=devDependencies)
[![NPM Status](http://img.shields.io/npm/dm/osom.svg?style=flat-square)](https://www.npmjs.org/package/osom)
[![Donate](https://img.shields.io/badge/donate-paypal-blue.svg?style=flat-square)](https://paypal.me/Kikobeats)

> An Awesome [/osom/] Object Schema Modeling. Inspired in [Mongoose Schema](https://github.com/Automattic/mongoose#defining-a-model).

## Install

```bash
$ npm install osom --save
```

If you want to use in the browser (powered by [Browserify](http://browserify.org/)):

```bash
$ bower install osom --save
```

and later link in your HTML:

```html
<script src="bower_components/osom/dist/osom.js"></script>
```
## Usage

```js
var osom = require('osom')

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
var validator = osom(schema)

// schema factory
validator({age: '  23  '}) // => {age: '23'}
```

## API

### osom(schema, [global])

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

###### type

Type: `function`

As in *basic* mode, it specifies the type casting of the output value:

```js
var schema = {
  age: {
    type: Number
  }
}
```

Internally it uses [chaste](https://github.com/Kikobeats/chaste). This makes easy casting compatible types:

```js
osom(schema)({age: '23'}) // => {age: 23}
```

###### casting

Type: `boolean`<br>
Default: `true`

It disables type casting and throws `TypeError` if the `typeof` of the value evaluation is not correct:

```js
var schema = {
  age: {
    type: String,
    casting: false
  }
}

osom(schema)({age: '23'}) // => TypeError("Expected a {string} for 'age'.")
```

###### required

Type: `boolean`|`array`<br>
Default: `false`

It marks a rule as required field and throws `TypeError` if value for the field is not present.

If you want to provide a custom error message, provide an `Array` where the second element represent the message:

```js
var schema = {
  age: {
    type: String,
    required: [true, 'your message here']
  }
}
```

###### default

Type: `whatever`|`function`<br>
Default: `null`

It sets a default value if `nill` value as input is provided.

Additionally you can provide a `Function` for set a dynamic value:

```js
var schema = {
  age: {
    type: Number, default: function () { return 23 }
  }
}
```

###### transform

Type: `array`<br>
Default: `[]`

An `Array` collection of data transforms as pipeline of methods to apply for the input value:

```js
function trim (str) {
  return str.trim()
}

var schema = {
  age: {
    type: String,
    transform: [trim]
  }
}
```

###### validate

Type: `function`|`object`<br>
Default: `null`

It setup a `Function` that will be exec to validate the input value and if it fails, it throws `TypeError`.

```js
var schema = {
  age: {
    type: String,
    validate: function (v) {
      return v === '23'
    }
  }
}

osom(schema)({age: 25}) // => TypeError("Fail '25' validation for 'age'.")
```

Providing a object brings you the possibility set up a custom error message:


```js
var schema = {
  age: {
    type: String,
    validate: {
      validator: function (v) {
        return v === '23'
      },
      message: 'expected a millenial value instead of {VALUE}!'
    }
  }
}

osom(schema)({age: 25}) // => TypeError("expected a millenial value instead of 25!")
```

#### global

Type: `object`<br>
Default: `{}`

Meanwhile is possible provide specific options per each rule, also is possible provide them as global to apply to all rule. This minimizes the schemas definitions:

```js
function trim (str) {
  return str.trim()
}

var schema = {
  age: {
    type: String
  }
}

var globalFields = {
  transform: [trim]
}

var validator = osom(schema, globalFields)
validator({age: '  23  '}) // => {age: '23'}
```

## License

MIT © [Kiko Beats](http://kikobeats.com)
