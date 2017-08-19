import { getRedisClient } from './getRedisClient'
import { send, showAllKeys } from './common'
export var numUsers = 0

var newMessageHandler = (env) => (data) => {
  var socket = env.socket
  if (data === 'show' || data === 'del') {
    console.log('\n')
    showAllKeys(data)
    console.log('\n')
  }

  if (data.includes('@')) {
    let trunk = data.split('@')
    let message = trunk[0]
    let listName = `${trunk[1]}:list`
    getRedisClient().lrange(listName, 0, -1, (err, sids) => {
      if (err) throw err
      for (let sid of sids) {
        send(socket, sid, message)
      }
    })
  } else {
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    })
  }
}

var addUserHandler = (env) => (username) => {
  var socket = env.socket
  if (env.addedUser) return
  getRedisClient().lpush(`${username}:list`, socket.id)
  // we store the username in the socket session for this client
  socket.username = username
  ++numUsers
  env.addedUser = true
  socket.emit('login', {
    numUsers: numUsers
  })
  // echo globally (all clients) that a person has connected
  socket.broadcast.emit('user joined', {
    username: socket.username,
    numUsers: numUsers
  })
}

var typingHandler = (env) => () => {
  let socket = env.socket
  socket.broadcast.emit('typing', {
    username: socket.username
  })
}

var stopTypingHandler = (env) => () => {
  let socket = env.socket
  socket.broadcast.emit('stop typing', {
    username: socket.username
  })
}
var disconnectHandler = (env) => (reason) => {
  var socket = env.socket
  if (env.addedUser) {
    --numUsers
    console.log(numUsers)
    getRedisClient().lrem(`${socket.username}:list`, 0, socket.id)
    // echo globally that this client has left
    console.log(`desconect: ${reason}`)
    socket.broadcast.emit('user left', {
      username: socket.username,
      numUsers: numUsers
    })
  }
}

export const urls = new Map([
  ['new message', newMessageHandler],
  ['add user', addUserHandler],
  ['typing', typingHandler],
  ['stop typing', stopTypingHandler],
  ['disconnect', disconnectHandler],
  // ['error', disconnectHandler]
])
