// Setup basic express server
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const port = process.env.PORT || 3000
const redis = require('redis')
const common = require('./common.js')
const path = require('path')
var redisClient = redis.createClient()
redisClient.FLUSHALL()
var redisFlag = false

function getRedisClient () {
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
// const io_redis = require('socket.io-redis');
// io.adapter(io_redis({ host: 'localhost', port: 6379 }));
server.listen(port, function () {
  console.log('Server listening at port %d', port)
})

// Routing
app.use(express.static(path.join(__dirname, 'public')))
// Chatroom
var numUsers = 0

io.on('connection', function (socket) {
  var addedUser = false
  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    if (data === 'show' || 'del') {
      console.log('\n')
      common.showAllKeys(data)
      console.log('\n')
    }

    if (data.includes('@')) {
      let trunk = data.split('@')
      let message = trunk[0]
      let listName = `${trunk[1]}:list`
      getRedisClient().lrange(listName, 0, -1, (err, sids) => {
        if (err) throw err
        for (let sid of sids) {
          common.send(socket, sid, message)
        }
      })
    } else {
      socket.broadcast.emit('new message', {
        username: socket.username,
        message: data
      })
    }

    // we tell the client to execute 'new message'
  })

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    if (addedUser) return
    getRedisClient().lpush(`${username}:list`, socket.id)
    // we store the username in the socket session for this client
    socket.username = username
    ++numUsers
    addedUser = true
    socket.emit('login', {
      numUsers: numUsers
    })
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    })
  })

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    })
  })

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    })
  })

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers
      getRedisClient().lrem(`${socket.username}:list`, 0, socket.id)
      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      })
    }
  })
})
