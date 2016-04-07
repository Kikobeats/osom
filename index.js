'use strict'

// var schema = new Schema({
//   name:    String,
//   binary:  Buffer,
//   living:  Boolean,
//   updated: { type: Date, default: Date.now },
//   age:     { type: Number, min: 18, max: 65 },
//   mixed:   Schema.Types.Mixed,
//   _someId: Schema.Types.ObjectId,
//   array:      [],
//   ofString:   [String],
//   ofNumber:   [Number],
//   ofDates:    [Date],
//   ofBuffer:   [Buffer],
//   ofBoolean:  [Boolean],
//   ofMixed:    [Schema.Types.Mixed],
//   ofObjectId: [Schema.Types.ObjectId],
//   nested: {
//     stuff: { type: String, lowercase: true, trim: true }
//   }
// })

var isFunction = require('lodash.isfunction')
var isString = require('lodash.isstring')
var isArray = require('lodash.isarray')
var reduce = require('lodash.reduce')
var assign = require('lodash.assign')
var flow = require('lodash/flow')
var chaste = require('chaste')
var type = require('fn-type')

// TODO: Add validation like mongoose
// validate: {
//   validator: function(v) {
//     return /\d{3}-\d{3}-\d{4}/.test(v)
//   },
//   message: '{VALUE} is not a valid phone number!'
// },

function exists (value) {
  return value != null
}

var DEFAULT = {
  BLUEPRINT: {
    casting: true,
    transform: []
  }
}

function createSchemaRule (rule) {
  var schema = typeof rule === 'function' ? { type: rule } : rule
  return assign({}, DEFAULT.BLUEPRINT, schema)
}

function addRule (schema, blueprint, name) {
  schema[name] = createSchemaRule(blueprint)
  return schema
}

function throwTypeError (name, type, required) {
  var msg
  if (isArray(required) && isString(required[1])) msg = required[1]
  else msg = 'Expected a {' + type + "} for '" + name + "'."
  throw new TypeError(msg)
}

function Ardent (schemaBlueprint) {
  if (!(this instanceof Ardent)) return new Ardent(schemaBlueprint)

  var schemaTypes = {}

  var schema = reduce(schemaBlueprint, function (schema, blueprint, name) {
    schema = addRule(schema, blueprint, name)

    var type = schema[name].type
    schemaTypes[name] = type.name.toLowerCase()
    schema[name].type = chaste(type)

    return schema
  }, {})

  function ardent (obj) {
    obj = obj || {}

    return reduce(schema, function applyRule (objSchema, rule, name) {
      var transforms = flow(rule.transform)
      var hasValue = exists(obj[name])

      console.log(schemaTypes[name])

      if ((rule.required && !hasValue) ||
        (!rule.casting && type(value !== schemaTypes[name]))) {
        throwTypeError(name, schemaTypes[name], rule.required)
      }

      var value
      if (hasValue) value = rule.type(obj[name])
      else if (!isFunction(rule.default)) value = rule.default
      else value = rule.default()

      objSchema[name] = transforms(value)
      return objSchema
    }, {})
  }

  return ardent
}

module.exports = Ardent
