import { save, showAllClients } from './common'
import {io} from './index'

export const newMessageHandler = (env) => (data) => {
  const socket = env.socket
  if (data === 'show' || data === 'del') {
    showAllClients(io)
  }
  if (data.includes('@')) {
    let trunk = data.split('@')
    let message = trunk[0]
    let name = trunk[1]
    // socket.to(name).username
    // let ids = nameToIds(name)
    io.of('/').adapter.allRooms((err, rooms) => {
      if (err) {
        console.log(err)
      }
      if (rooms.includes(name)) {
        socket.to(name)
          .emit('new message', {
            username: `${socket.username}(private message)`,
            message: message })
      } else {
        save()
        socket.emit('new message', {
          username: `${socket.username}(no One with this name: ${name})`,
          message: 'so I have saved for you until he is here'
        })
      }
    })
  } else {
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    })
  }
}

export const addUserHandler = (env) => (username) => {
  const socket = env.socket
  if (env.addedUser) return
  // we store the username in the socket session for this client
  socket.username = username
  ++global.numUsers
  env.addedUser = true

  console.log(`addedUser: ${socket.id}, ${username}, now ${global.numUsers}`)
  // redisLogin(socket)
  socket.emit('login', {
    numUsers: global.numUsers
  })
  // showAllClients(io)
  socket.join(socket.username)
  io.of('/').adapter.allRooms((err, rooms) => {
    if (err) {
      console.log(err)
    }
    console.log(rooms) // an array containing all rooms (accross every node)
  })
  // echo globally (all clients) that a person has connected
  socket.broadcast.emit('user joined', {
    username: socket.username,
    numUsers: global.numUsers
  })
}

export const typingHandler = (env) => () => {
  let socket = env.socket
  socket.broadcast.emit('typing', {
    username: socket.username
  })
}

export const stopTypingHandler = (env) => () => {
  let socket = env.socket
  socket.broadcast.emit('stop typing', {
    username: socket.username
  })
}

export const disconnectHandler = (env) => (reason) => {
  const socket = env.socket
  if (env.addedUser) {
    --global.numUsers
    showAllClients(io)
    socket.broadcast.emit('user left', {
      username: socket.username,
      numUsers: global.numUsers
    })
  }
}
