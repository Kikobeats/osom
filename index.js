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
var assign = require('lodash/assign')
var flow = require('lodash/flow')
var chaste = require('chaste')

function exists (value) {
  return value != null
}

function createSchemaRule (rule) {
  var blueprint = { filter: [] }
  var schema = typeof rule === 'function' ? { type: rule } : rule
  return assign(blueprint, schema)
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
      var applyFilters = flow(rule.filter)
      var value = exists(obj[name]) ? rule.type(obj[name]) : rule.default
      objSchema[name] = applyFilters(value)
      return objSchema
    }, {})
  }

  return ardent
}

module.exports = Ardent
