var redis = require('redis')
const client = redis.createClient()

module.exports = {
  save: (socket, sessionId, message) => {
    console('ok, I have save it now')
  },
  send: (socket, sessionId, message) => {
    console.log(sessionId)
    socket.broadcast.to(sessionId).emit('new message', {
      username: `${socket.username}(private message)`,
      message: message
    })
  },
  showAllKeys: (data) => {
    if (data === 'del') {
      console.log('flush')
      client.FLUSHALL()
    }
    client.keys('*', (err, keys) => {
      if (err) throw err
      for (let key of keys) {
        client.type(key, (err, type) => {
          if (err) throw err
          if (type === 'list') {
            client.lrange(key, 0, -1, (err, values) => {
              if (err) throw err
              console.log(key + ' : ' + values)
            })
          }
        })
      }
    })
  }
}
