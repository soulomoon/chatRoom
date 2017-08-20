import redis from 'redis'
import bluebird from 'bluebird'

bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

export function redisLogin (socket) {
  if (global._REDISWRITEABLE) {
    global._REDISCLIENT.lrem(`${socket.username}:list`, 0, socket.id)
  } else {
    console.log('exiting protection')
  }
}

//
// export async function showAllKeys (data) {
//   if (data === 'del') {
//     console.log('flush')
//     global._REDISCLIENT.FLUSHALL()
//   }
//
//   let keys = await global._REDISCLIENT.keysAsync('*')
//   if (keys.length) {
//     console.log(keys)
//     // delete all list
//     await Promise.all(keys.filter(key => Boolean(key)).map(key => global._REDISCLIENT.lrangeAsync(key, 0, -1)
//       .then(values => {
//         if (values) console.log(key + ' : ' + values)
//         else console.log('no values')
//       })
//     ))
//   } else {
//     console.log('========all clear==========')
//   }
// }
