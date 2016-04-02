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

// TODO: Add strict mode

var reduce = require('lodash/reduce')
var chaste = require('chaste')
var lodash = require('lodash')

function createSchemaRule (rule) {
  var blueprint = {}
  var schema = typeof rule === 'function' ? { type: rule } : rule
  return lodash.assign(blueprint, schema)
}

function addSchemaRule (schema, blueprint, name) {
  var rule = createSchemaRule(blueprint)
  rule.type = chaste(rule.type)
  schema[name] = rule
  return schema
}

function Ardent (schemaBlueprint) {
  if (!(this instanceof Ardent)) return new Ardent(schemaBlueprint)

  var schema = reduce(schemaBlueprint, addSchemaRule, {})

  function ardent (obj) {
    obj = obj || {}

    return reduce(schema, function applyRule (objSchema, rule, name) {
      objSchema[name] = obj[name] ? rule.type(obj[name]) : rule.default
      return objSchema
    }, {})
  }

  return ardent
}

module.exports = Ardent
