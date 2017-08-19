const redis = require('redis')

var redisFlag = false
var redisClient = redis.createClient()
// redisClient.FLUSHALL()

export function getRedisClient () {
  if (redisFlag) {
    return redisClient
  }
  redisClient = redis.createClient()
  redisClient.on('end', function () {
    redisFlag = false
  })
  redisClient.on('error', function (err) {
    // assert(err instanceof Error)
    // assert(err instanceof redis.AbortError)
    // assert(err instanceof redis.AggregateError)
    // The set and get get aggregated in here
    // assert.strictEqual(err.errors.length, 2)
    // assert.strictEqual(err.code, 'NR_CLOSED')
    console.log(err)
  })
  return redisClient
}
