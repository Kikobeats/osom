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
})
