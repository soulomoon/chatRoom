import {io} from './index'

export function save (socket, sessionId, message) {
  console.log('ok, I have save it now')
}

export function send (socket, sessionId, message) {
  console.log(sessionId)
  socket.broadcast.to(sessionId).emit('new message', {
    username: `${socket.username}(private message)`,
    message: message
  })
}

export function showAllClients (io) {
  io.of('/').adapter.clients((err, clients) => {
    console.log(clients) // an array containing all connected socket ids
  })
}
