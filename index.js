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

var chaste = require('chaste')
var reduce = require('lodash/reduce')

function Ardent (schema) {
  if (!(this instanceof Ardent)) return new Ardent(schema)

  var definitions = reduce(schema, function addRule (acc, schemaRule, schemaRuleName) {
    var rule = schemaRule.type || schemaRule
    acc[schemaRuleName] = chaste(rule)
    return acc
  }, {})

  function ardent (obj) {
    return reduce(definitions, function applyRule (acc, chaste, name) {
      acc[name] = chaste(obj[name])
      return acc
    }, {})
  }

  return ardent
}

module.exports = Ardent
