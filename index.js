'use strict'

const { merge, reduce } = require('lodash')
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

function createTypeError (message, key, value) {
  const error = new TypeError(message)
  error.key = key
  error.value = value
  return error
}

function throwTypeError (key, value, type, message) {
  if (!message || isBoolean(message)) message = `Expected {${type}} for '${key}'.`
  throw createTypeError(message, key, value)
}

function throwValidationError (key, value, description) {
  let message
  if (description) message = description.replace('{VALUE}', value)
  else message = `Fail '${value}' validation for '${key}'.`
  throw createTypeError(message, key, value)
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
      const value = obj[name]
      const hasValue = exists(value)
      const isRequired = rule.required
      const isMissing = isRequired && !hasValue
      const expectedValue = schemaTypes[name]

      if (isMissing) throwTypeError(name, value, expectedValue, isRequired)

      const isCasting = rule.casting
      const isCastingDisabled = hasValue && !isCasting
      const isSameType = type(value) === expectedValue
      const isInvalidType = isCastingDisabled && !isSameType
      if (isInvalidType) throwTypeError(name, value, expectedValue, isRequired)

      let TypedValue
      const defaultValue = rule.default
      const validate = rule.validate
      if (hasValue) TypedValue = isCasting ? rule.type(value) : value
      else if (defaultValue) TypedValue = !isFunction(defaultValue) ? defaultValue : defaultValue()

      // lodash.flow is buggy, this is a workaround (and dep-free)
      TypedValue = reduce(rule.transform, (acc, fn) => fn(acc), TypedValue)

      if (hasValue && validate) {
        const validator = getValidator(rule)
        if (!validator(TypedValue)) throwValidationError(name, value, validate.message)
      }

      if (exists(TypedValue)) objSchema[name] = TypedValue
      return objSchema
    }, {})
  }

  return osom
}

module.exports = Osom
