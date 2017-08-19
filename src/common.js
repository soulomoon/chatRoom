import {getRedisClient} from './getRedisClient'

export function save (socket, sessionId, message) {
  console('ok, I have save it now')
}

export function send (socket, sessionId, message) {
  console.log(sessionId)
  socket.broadcast.to(sessionId).emit('new message', {
    username: `${socket.username}(private message)`,
    message: message
  })
}

export function showAllKeys (data) {
  if (data === 'del') {
    console.log('flush')
    getRedisClient().FLUSHALL()
  }
  getRedisClient().keys('*', (err, keys) => {
    if (err) throw err
    for (let key of keys) {
      getRedisClient().type(key, (err, type) => {
        if (err) throw err
        if (type === 'list') {
          getRedisClient().lrange(key, 0, -1, (err, values) => {
            if (err) throw err
            console.log(key + ' : ' + values)
          })
        }
      })
    }
  })
}
