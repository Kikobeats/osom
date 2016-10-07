/* global describe, it */

'use strict'

require('should')
var osom = require('..')

describe('schema defintion', function () {
  describe('simple rule', function () {
    it('empty value', function () {
      [{age: Number}, {age: { type: Number }}].forEach(function (rule) {
        osom(rule)().should.be.eql({})
      })
    })

    it('providing value', function () {
      [{age: Number}, {age: { type: Number }}].forEach(function (rule) {
        osom(rule)({age: '23'}).should.be.eql({age: 23})
      })
    })
  })

  it('empty values', function () {
    [Number, String, Function, Boolean].forEach(function (type) {
      var schema = {
        age: {
          type: type
        }
      }

      var validator = osom(schema)
      ;[null, {}].forEach(function (data) {
        validator(data).should.be.eql({})
      })
    })
  })

  describe('support default values', function () {
    it('based in a value', function () {
      var schema = {
        age: {
          type: Number, default: 23
        }
      }

      var validator = osom(schema)
      validator().should.be.eql({age: 23})
    })

    it('based in a fn', function () {
      var schema = {
        age: {
          type: Number, default: function () { return 23 }
        }
      }

      var validator = osom(schema)
      validator().should.be.eql({age: 23})
    })
  })

  it('support transforms', function () {
    function trim (str) {
      return str.trim()
    }

    var schema = {
      age: {
        type: String,
        transform: [trim]
      }
    }

    var validator = osom(schema)
    validator({age: '  23  '}).should.be.eql({age: '23'})
  })

  describe('support required values', function () {
    it('throw an error under no values', function () {
      var schema = {
        age: {
          type: String,
          required: true
        }
      }

      var validator = osom(schema)
      var errMessage = "Expected a {string} for 'age'."
      ;(function () { validator() }).should.throw(errMessage)
    })

    it('custom error message', function () {
      var schema = {
        age: {
          type: String,
          required: 'your message here'
        }
      }

      var validator = osom(schema)
      var errMessage = 'your message here'
      ;(function () { validator() }).should.throw(errMessage)
    })
  })

  xdescribe('support casting (by default)', function () {
    it('disable explicit', function () {
      var schema = {
        age: {
          type: String,
          casting: false
        }
      }

      var errMessage = "Expected a {string} for 'age'."
      var validator = osom(schema)

      ;[{age: 23}].forEach(function (obj) {
        ;(function () { validator(obj) }).should.throw(errMessage)
      })
    })

    it('disable explicit works with nill values', function () {
      [Number, String, Function, Boolean].forEach(function (type) {
        var schema = {
          age: {
            type: type,
            casting: false
          }
        }

        var validator = osom(schema)
        ;[null, {}, {age: null}].forEach(function (data) {
          validator(data).should.be.eql({})
        })
      })
    })
  })

  xdescribe('support validation', function () {
    it('based in a function', function () {
      var schema = {
        age: {
          type: String,
          validate: function (v) {
            return v === '23'
          }
        }
      }

      var validator = osom(schema)
      var errMessage = "Fail '25' validation for 'age'."
      ;(function () { validator({age: 25}) }).should.throw(errMessage)
    })

    it('based in a object key', function () {
      var schema = {
        age: {
          type: String,
          validate: {
            validator: function (v) {
              return v === '23'
            }
          }
        }
      }

      var validator = osom(schema)
      var errMessage = "Fail '25' validation for 'age'."
      ;(function () { validator({age: 25}) }).should.throw(errMessage)
    })

    it('custom error message', function () {
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

      var validator = osom(schema)
      var errMessage = 'expected a millenial value instead of 25!'
      ;(function () { validator({age: 25}) }).should.throw(errMessage)
    })
  })
})

describe('behavior', function () {
  it('custom global values', function () {
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
    validator({age: '  23  '}).should.be.eql({age: '23'})
  })
})
