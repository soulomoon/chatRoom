import * as assert from 'assert'
const redis = require('redis')

module.exports = {
  errHandler: function (err) {
    if (err) {
      assert(err instanceof redis.AbortError)
      console.log(err)
    }
  }
}
