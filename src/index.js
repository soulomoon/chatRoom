import {urls} from './urls'
import {cleanUp} from './cleanUp'
import express from 'express'
import http from 'http'
import socketIo from 'socket.io'
import path from 'path'
import ioRedis from 'socket.io-redis'

const app = express()
const server = http.createServer(app)
const io = socketIo(server)
const port = process.env.PORT || 3000
io.adapter(ioRedis({ host: 'localhost', port: 6379 }))
server.listen(port, function () {
  console.log('Server listening at port %d', port)
})

// Routing
app.use(express.static(path.join(__dirname, 'public')))

io.on('connection', function (socket) {
  var addedUser = false
  var env = {
    socket: socket,
    addedUser: addedUser
  }
  for (let [path, func] of urls) {
    socket.on(path, func(env))
  }
})

// cleanUp redis
cleanUp(io)

// process.stdin.resume()// so the program will not close instantly
//
// function exitHandler (options, err) {
//   io.close()
//   console.log(io.sockets)
//
//   if (options.cleanup) console.log('clean')
//   if (err) console.log(err.stack)
//   if (options.exit) process.exit()
// }
//
// // do something when app is closing
// process.on('exit', exitHandler.bind(null, {cleanup: true}))
//
// // catches ctrl+c event
// process.on('SIGINT', exitHandler.bind(null, {exit: true}))
//
// // catches uncaught exceptions
// process.on('uncaughtException', exitHandler.bind(null, {exit: true}))
