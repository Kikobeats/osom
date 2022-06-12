/* global describe, it */

'use strict'

const should = require('should')
const osom = require('..')

describe('schema defintion', function () {
  describe('simple rule', function () {
    it('empty value', function () {
      ;[{ age: Number }, { age: { type: Number } }].forEach(function (rule) {
        osom(rule)().should.be.eql({})
      })
    })

    describe('providing value', function () {
      it('Number', function () {
        ;[{ age: Number }, { age: { type: Number } }].forEach(function (rule) {
          osom(rule)({ age: '23' }).should.be.eql({ age: 23 })
        })
      })

      it('Array', function () {
        ;[{ age: Array }, { age: { type: Array } }].forEach(function (rule) {
          osom(rule)({ age: ['23'] }).should.be.eql({ age: ['23'] })
        })
      })
    })
  })

  it('empty values', function () {
    ;[Number, String, Function, Boolean].forEach(function (type) {
      const schema = {
        age: {
          type
        }
      }

      const validator = osom(schema)
      ;[null, {}].forEach(function (data) {
        validator(data).should.be.eql({})
      })
    })
  })

  describe('support default values', function () {
    it('based in a value', function () {
      const schema = {
        age: {
          type: Number,
          default: 23
        }
      }

      const validator = osom(schema)
      validator().should.be.eql({ age: 23 })
    })

    it('based in a fn', function () {
      const schema = {
        age: {
          type: Number,
          default: function () {
            return 23
          }
        }
      }

      const validator = osom(schema)
      validator().should.be.eql({ age: 23 })
    })
  })

  it('support transforms', function () {
    function trim (str) {
      return str.trim()
    }

    const schema = {
      age: {
        type: String,
        transform: trim
      }
    }

    const validator = osom(schema)
    validator({ age: '  23  ' }).should.be.eql({ age: '23' })
  })

  it('support a collection of transforms', function () {
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
    validator({ age: '  23  ' }).should.be.eql({ age: '23' })
  })

  describe('support required values', function () {
    it('throw an error under no values', function () {
      const schema = {
        age: {
          type: String,
          required: true
        }
      }

      const validator = osom(schema)
      ;(function () {
        validator()
      }.should.throw('Expected `string` for `age`, got `undefined`'))
    })

    it('custom error message', function () {
      const schema = {
        age: {
          type: String,
          required: 'your message here'
        }
      }

      const validator = osom(schema)
      const errMessage = 'your message here'
      ;(function () {
        validator()
      }.should.throw(errMessage))
    })
  })

  describe('support casting by default', function () {
    it('enable (by default)', function () {
      const schema = { age: Array }
      const validator = osom(schema)
      validator({ age: '23' }).should.be.eql({ age: ['23'] })
    })
  })

  describe('casting disabled explicitly', function () {
    it('throw an error under different type provided', function () {
      const schema = {
        age: {
          type: String
        }
      }

      const validator = osom(schema, { casting: false })
      ;[{ age: 23 }].forEach(function (obj) {
        ;(function () {
          validator(obj)
        }.should.throw('Expected `string` for `age`, got `23`'))
      })
    })

    it('works with nill values of the same type', function () {
      ;[Number, String, Function, Boolean].forEach(function (type) {
        const schema = {
          age: {
            type
          }
        }

        const validator = osom(schema, { casting: false })
        ;[null, {}, { age: null }].forEach(function (data) {
          validator(data).should.be.eql({})
        })
      })
    })

    it('works with default value (not necessary of the same type defined)', function () {
      const schema = {
        age: {
          type: String,
          default: 23
        }
      }

      const validator = osom(schema, { casting: false })
      validator({}).should.be.eql({ age: 23 })
    })

    it('works with a value provided of the same type', function () {
      const schema = {
        age: {
          type: String,
          default: '24'
        }
      }

      const validator = osom(schema, { casting: false })
      validator({ age: '23' }).should.be.eql({ age: '23' })
    })
  })

  describe('support validation', function () {
    it('based in a function', function () {
      const schema = {
        age: {
          type: String,
          validate: function (v) {
            return v === '23'
          }
        }
      }

      const validator = osom(schema)
      ;(function () {
        validator()
      }.should.throw("Fail 'undefined' validation for 'age'."))
      ;(function () {
        validator({})
      }.should.throw("Fail 'undefined' validation for 'age'."))
      ;(function () {
        validator({ age: 25 })
      }.should.throw("Fail '25' validation for 'age'."))
    })

    it('based in a object key', function () {
      const schema = {
        age: {
          type: String,
          validate: {
            validator: function (v) {
              return v === '23'
            }
          }
        }
      }

      const validator = osom(schema)
      ;(function () {
        validator()
      }.should.throw("Fail 'undefined' validation for 'age'."))
      ;(function () {
        validator({})
      }.should.throw("Fail 'undefined' validation for 'age'."))
      ;(function () {
        validator({ age: 25 })
      }.should.throw("Fail '25' validation for 'age'."))
    })

    it('custom error message', function () {
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
      const errMessage = 'expected a millenial value instead of 25!'
      ;(function () {
        validator({ age: 25 })
      }.should.throw(errMessage))
    })

    it('custom error message as function', function () {
      const schema = {
        age: {
          type: String,
          validate: {
            validator: function (v) {
              return v === '23'
            },
            message: v => `expected a millenial value instead of ${v}!`
          }
        }
      }

      const validator = osom(schema)
      const errMessage = 'expected a millenial value instead of 25!'
      ;(function () {
        validator({ age: 25 })
      }.should.throw(errMessage))
    })
  })
})

describe('error', function () {
  describe('attach key and value into error object', function () {
    it('when value is not present', function () {
      const schema = {
        age: {
          type: String,
          required: true
        }
      }

      const validator = osom(schema)

      try {
        validator()
      } catch (err) {
        err.key.should.be.equal('age')
        should(err.value).be.undefined()
      }
    })

    it('when value is present', function () {
      const schema = {
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

      const validator = osom(schema)

      try {
        validator({ age: 25 })
      } catch (err) {
        err.key.should.be.equal('age')
        err.value.should.be.equal(25)
      }
    })
  })
})

describe('behavior', function () {
  it('custom global values', function () {
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
    validator({ age: '  23  ' }).should.be.eql({ age: '23' })
  })
})
