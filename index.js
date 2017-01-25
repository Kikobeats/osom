'use strict'

const reduce = require('lodash.reduce')
const merge = require('lodash.merge')
const chaste = require('chaste')
const type = require('kind-of')

const exists = (value) => value != null

const DEFAULT = {
  BLUEPRINT: {
    casting: true,
    transform: []
  }
}

function createSchemaRule (rule, globalRules) {
  const schema = isFunction(rule) ? { type: rule } : rule
  const fields = merge({}, globalRules, schema)
  return Object.assign({}, DEFAULT.BLUEPRINT, fields)
}

function addRule (globalRules, schema, blueprint, name) {
  schema[name] = createSchemaRule(blueprint, globalRules)
  return schema
}

function createTypeError (message, field) {
  const error = new TypeError(message)
  error.field = field
  return error
}

function throwTypeError (name, type, message) {
  if (!message || isBoolean(message)) message = `Expected {${type}} for '${name}'.`
  throw createTypeError(message, name)
}

function throwValidationError (name, value, description) {
  let message
  if (description) message = description.replace('{VALUE}', value)
  else message = `Fail '${value}' validation for '${name}'.`
  throw createTypeError(message, name)
}

function getValidator (rule) {
  const validate = rule.validate
  return isFunction(validate) ? validate : validate.validator
}

function isBoolean (value) {
  return type(value) === 'boolean'
}

function isFunction (value) {
  return type(value) === 'function'
}

function Osom (schemaBlueprint, globalRules) {
  if (!(this instanceof Osom)) return new Osom(schemaBlueprint, globalRules)
  globalRules = globalRules || {}
  const schemaTypes = {}

  const schema = reduce(schemaBlueprint, function (schema, blueprint, name) {
    schema = addRule(globalRules, schema, blueprint, name)
    const type = schema[name].type
    schemaTypes[name] = type.name.toLowerCase()
    schema[name].type = chaste(type)
    return schema
  }, {})

  function osom (obj) {
    obj = obj || {}

    return reduce(schema, function applyRule (objSchema, rule, name) {
      let value = obj[name]
      const hasValue = exists(value)
      const isMissing = rule.required && !hasValue
      if (isMissing) throwTypeError(name, schemaTypes[name], rule.required)

      const isCastingDisabled = hasValue && !rule.casting
      const isSameType = type(value) === schemaTypes[name]
      const isInvalidType = isCastingDisabled && !isSameType
      if (isInvalidType) throwTypeError(name, schemaTypes[name], rule.required)

      if (hasValue) value = rule.casting ? rule.type(obj[name]) : obj[name]
      else if (rule.default) value = !isFunction(rule.default) ? rule.default : rule.default()

      // lodash.flow is buggy, this is a workaround (and dep-free)
      value = reduce(rule.transform, (acc, fn) => fn(acc), value)

      if (hasValue && rule.validate) {
        const validator = getValidator(rule)
        if (!validator(value)) throwValidationError(name, value, rule.validate.message)
      }

      if (exists(value)) objSchema[name] = value
      return objSchema
    }, {})
  }

  return osom
}

module.exports = Osom
