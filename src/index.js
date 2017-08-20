import {urls} from './urls'
import { cleanUp, enableDestroy } from './cleanUp'
import express from 'express'
import http from 'http'
import socketIo from 'socket.io'
import path from 'path'
import ioRedis from 'socket.io-redis'
import * as redis from 'redis'

global._REDISWRITEABLE = true
global._REDISCLIENT = redis.createClient()
global.numUsers = 0

const app = express()
const server = http.createServer(app)
export const io = socketIo(server)
enableDestroy(server)

const port = process.env.PORT || 3000
server.listen(port, function () {
  console.log('Server listening at port %d', port)
})
// setup cleanUp redis
cleanUp(io, server)
// Routing
app.use(express.static(path.join(__dirname, 'public')))

io.adapter(ioRedis({ host: '127.0.0.1', port: 6379 }))

io.on('connection', function (socket) {
  let addedUser = false
  let env = {
    socket: socket,
    addedUser: addedUser
  }
  for (let [path, func] of urls) {
    socket.on(path, func(env))
  }
})
