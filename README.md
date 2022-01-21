# osom

<!-- {.massive-header.-with-tagline} -->

> An Awesome [/osom/] Object Data Modeling. Inspired in [mongoose ](https://github.com/Automattic/mongoose#defining-a-model) but Database Agnostic.

![Last version](https://img.shields.io/github/tag/Kikobeats/osom.svg?style=flat-square)
[![Build Status](https://img.shields.io/travis/Kikobeats/osom/master.svg?style=flat-square)](https://travis-ci.org/Kikobeats/osom)
[![Coverage Status](https://img.shields.io/coveralls/Kikobeats/osom.svg?style=flat-square)](https://coveralls.io/github/Kikobeats/osom)
[![Dependency status](https://img.shields.io/david/Kikobeats/osom.svg?style=flat-square)](https://david-dm.org/Kikobeats/osom)
[![Dev Dependencies Status](https://img.shields.io/david/dev/Kikobeats/osom.svg?style=flat-square)](https://david-dm.org/Kikobeats/osom#info=devDependencies)
[![NPM Status](https://img.shields.io/npm/dm/osom.svg?style=flat-square)](https://www.npmjs.org/package/osom)
[![Donate](https://img.shields.io/badge/donate-paypal-blue.svg?style=flat-square)](https://paypal.me/Kikobeats)

## Installation

```bash
$ npm install osom --save
```

## Preview

```js
const osom = require('osom')

function trim (str) {
  return str.trim()
}

function isValidTitle (str) {
  return str.length > 0
}

// setup your schema
const schema = {
  title: {
    type: String,
    validate: isValidTitle,
    transform: [trim]
  },
  category: String,
  type: String,
  source: String,
  link: String,
  createdAt: String,
  updatedAt: String
}

// create validator based on schemas
const validator = osom(schema)

// validate it!
validator({ title: '  23  ' }) // => {title: '23'}
```

## Usage

osom(schema, [global])
<!-- {.font-large} -->

where:

- `schema`: It represents a set of rules (one per each key) that will be used for validate an object.
- `global` (optional): It brings you the possibility to declare global rules definition as helper to avoid write repetitive code.

After that, you will have a validator `function` that you can invoke passing the object to be validate.

## Schema

### Simple

The most common use case is validate the `type` of something.

If you are only interested in the `type`, you can provide a simple schema like:

```js
const simpleSchema = {
  age: Number
}
```

Where `key` is the name of the rule and `value` the `type` of it.

### Advanced

The *basic* mode is a simplification of the *advanced* mode for the most common use case.

While in *basic* mode only is possible setup `type`, in *advanced* mode you can setup more things providing a configurable `object`.

Each key of the object represent a **rule** . It's possible setup different things in the same rule.

## Defining Rules

### type

Type: `function`

As in *basic* mode, it specifies the `type` of the output value:

```js
const schema = {
  age: {
    type: Number
  }
}
```

Internally it uses [chaste](https://github.com/Kikobeats/chaste). This makes easy casting compatible types:

```js
const schema = {
  age: {
    type: Number
  }
}

const validator = osom(schema)
validator({ age: '23' }) // => {age: 23}
```

### casting

Type: `boolean`<br>
Default: `true`

It enable/disable type casting.
An `TypeError` will be throwed under different `type` evaluation.

```js
const schema = {
  age: {
    type: String,
    casting: false
  }
}

const validator = osom(schema)
validator({ age: '23' }) // => TypeError("Expected a {string} for 'age'.")
```

### required

Type: `boolean`|`string`<br>
Default: `false`

It marks a rule as required field and throws `TypeError` if value for the field is not present.

Additionally is possible provide a custom error message. For do it, pass an `String`.

```js
const schema = {
  age: {
    type: String,
    required: 'sorry but you must provide an age.'
  }
}

const validator = osom(schema)
validator({}) // => TypeError("sorry but you must provide an age")
```

### default

Type: `string`|`object`|`number`|`boolean`|`function`<br>
Default: `null`

It sets a default value if `nill` value as input is provided.

Additionally you can provide a `function` for set a dynamic value:

```js
const schema = {
  age: {
    type: Number, default: function () { return 23 }
  }
}

const validator = osom(schema)
validator({}) // => { age: 23 }
```

### transform

Type: `function`|`array`<br>
Default: `[]`

It transforms the input value.

The Methods provided in the `array` are applied as pipeline (the input of the second is the output of the first).

```js
function trim (str) {
  return str.trim()
}

const schema = {
  age: {
    type: String,
    transform: [trim]
  }
}

const validator = osom(schema)
validator({ age: '    23   ' }) // => { age: '23' }
```

### validate

Type: `function`|`object`<br>
Default: `null`

It set up a `function` that will be exec to validate the input value.
If it fails, it throws `TypeError`.

```js
const schema = {
  age: {
    type: String,
    validate: function (v) {
      return v === '23'
    }
  }
}

const validator = osom(schema)
validator({ age: 25 }) // => TypeError("Fail '25' validation for 'age'.")
```

Providing a object brings you the possibility set up a custom error message:

```js
const schema = {
  age: {
    type: String,
    validate: {
      validator: function (v) {
        return v === '23'
      },
      message: 'expected a millenial value instead of %s!'
    }
  }
}

const validator = osom(schema)
validator({ age: 25 }) // => TypeError("expected a millenial value instead of 25!")
```

## Defining Global Rules

While is possible provide specific setup per each rule, also is possible provide them as global to apply to all rules.

This minimizes the schemas definitions.

```js
function trim (str) {
  return str.trim()
}

const schema = {
  age: {
    type: String
  }
}

const globalFields = {
  transform: [trim]
}

const validator = osom(schema, globalFields)
validator({ age: '  23  ' }) // => {age: '23'}
```

No problem if later you need to avoid it for a specific case.

```js
function trim (str) {
  return str.trim()
}

const schema = {
  age: {
    type: String,
    transform: []
  }
}

const globalFields = {
  transform: [trim]
}

const validator = osom(schema, globalFields)
validator({ age: '  23  ' }) // => {age: '  23  '}
```

## Tips

### Working with async code

This library works synchronously.

However, you can use it comfortably in a async workflow transforming the interface into a callback/promise style.

For example, consider use [async#asyncify](https://github.com/caolan/async#asyncify) for do it. we could have a `schema.js` file like:

```js
const schema = osom({
  title: {
    type: String,
    validate: isValidTitle,
    transform: [trim]
  },
  category: String,
  type: String,
  source: String,
  link: String,
  createdAt: String,
  updatedAt: String
})

module.exports = async.asyncify(schema)
module.exports.sync = schema
```

Then you only need use it into a async workflow:

```js
const schema = require('./schema')
schema(data, function (validationError, instance) {
  /** do something */
})
```

Be careful: this transformation doesn't mean that the function works now asynchronously; Just is converting
`try-catch` interface into `callback(err, data)`.

## License

MIT © [Kiko Beats](https://kikobeats.com)
