'use strict'

const { isNil, isFunction, isBoolean, merge, reduce, castArray } = require('lodash')
const { format } = require('util')
const chaste = require('chaste')
const is = require('kind-of')

const DEFAULT = {
  BLUEPRINT: {
    casting: true,
    transform: []
  }
}

function createSchemaRule (rule, globalRules) {
  const schema = isFunction(rule) ? { type: rule } : rule
  const fields = merge({}, globalRules, schema)
  return Object.assign({ ...DEFAULT.BLUEPRINT, ...fields })
}

function addRule (globalRules, schema, blueprint, name) {
  schema[name] = createSchemaRule(blueprint, globalRules)
}

function typeError (message, key, value) {
  const error = new TypeError(message)
  error.key = key
  error.value = value
  return error
}

function throwTypeError (key, value, type, message) {
  if (!message || isBoolean(message)) {
    message = `Expected \`${type}\` for \`${key}\`, got \`${value}\``
  }
  throw typeError(message, key, value)
}

function throwValidationError (key, value, description) {
  let message
  if (description) {
    message = isFunction(description) ? description(value) : format(description, value)
  } else message = `Fail '${value}' validation for '${key}'.`
  throw typeError(message, key, value)
}

function getValidator (rule) {
  const validate = rule.validate
  return isFunction(validate) ? validate : validate.validator
}

function Osom (schemaBlueprint, globalRules) {
  if (!(this instanceof Osom)) return new Osom(schemaBlueprint, globalRules)
  globalRules = globalRules || {}
  const schemaTypes = {}

  const schema = reduce(
    schemaBlueprint,
    function (schema, blueprint, name) {
      addRule(globalRules, schema, blueprint, name)
      const type = schema[name].type
      schemaTypes[name] = type.name.toLowerCase()
      schema[name].type = chaste(type)
      return schema
    },
    {}
  )

  function osom (obj) {
    obj = obj || {}

    return reduce(
      schema,
      function applyRule (objSchema, rule, name) {
        const value = obj[name]
        const hasValue = !isNil(value)
        const validate = rule.validate
        const isRequired = rule.required || !isNil(validate)
        const expectedValue = schemaTypes[name]

        const isMissing = !hasValue && !validate && isRequired
        if (isMissing) throwTypeError(name, value, expectedValue, isRequired)

        const isCasting = rule.casting
        const isCastingDisabled = hasValue && !isCasting
        const isInvalidType = isCastingDisabled && is(value) !== expectedValue
        if (isInvalidType) {
          throwTypeError(name, value, expectedValue, isRequired)
        }

        let TypedValue
        const defaultValue = isFunction(rule.default) ? rule.default : () => rule.default
        if (hasValue) TypedValue = isCasting ? rule.type(value) : value
        else if (defaultValue) TypedValue = defaultValue()

        TypedValue = reduce(castArray(rule.transform), (acc, fn) => fn(acc, obj), TypedValue)

        if (isRequired && validate) {
          const validator = getValidator(rule)
          if (!validator(TypedValue)) {
            throwValidationError(name, value, validate.message)
          }
        }

        if (!isNil(TypedValue)) objSchema[name] = TypedValue
        return objSchema
      },
      {}
    )
  }

  return osom
}

module.exports = Osom
