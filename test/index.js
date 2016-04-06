/* global describe, it */

'use strict'

require('should')
var Ardent = require('..')

describe('schema defintion', function () {
  it('simple rule', function () {
    [{age: Number}, {age: { type: Number }}].forEach(function (rule) {
      Ardent(rule)({age: '23'}).should.be.eql({age: 23})
    })
  })

  it('support default value', function () {
    var schema = {
      age: {
        type: Number, default: 23
      }
    }

    var ardent = Ardent(schema)
    ardent().should.be.eql({age: 23})
  })

  it('support filters', function () {
    function trim (str) {
      return str.trim()
    }

    var schema = {
      age: {
        type: String,
        filter: [trim]
      }
    }

    var ardent = Ardent(schema)
    ardent({age: '  23  '}).should.be.eql({age: '23'})
  })

  describe('support required values', function () {
    it('throw an error under no values', function () {
      var schema = {
        age: {
          type: String,
          required: true
        }
      }

      var ardent = Ardent(schema)
      var errMessage = "Need to provide {String} for 'age' field."
      ;(function () { ardent() }).should.throw(errMessage)
    })
  })
})
