
export function cleanUp (io, server) {
  function exitHandler (options, err) {
    if (options.exit) {
      process.stdin.resume()// so the program will not close instantly
      global._REDISWRITEABLE = false
      server.destroy(() => {
        io.close(() => {
          console.log('\nclean')
          if (options.cleanup) console.log('clean')
          if (err) console.log(err.stack)
          if (options.exit) process.exit()
        })
      })
    }
  }

  // do something when app is closing
  process.on('exit', exitHandler.bind(null, {cleanup: true}))

  // catches ctrl+c event
  process.on('SIGINT', exitHandler.bind(null, {exit: true}))

  // catches uncaught exceptions
  process.on('uncaughtException', exitHandler.bind(null, {exit: true}))
}

// this is a patch
// for exiting gracefully
export function enableDestroy (server) {
  let connections = {}

  server.on('connection', function (conn) {
    let key = conn.remoteAddress + ':' + conn.remotePort
    // console.log(key)
    connections[key] = conn
    conn.on('close', function () {
      delete connections[key]
    })
  })

  server.destroy = function (cb) {
    server.close(cb)
    for (let key in connections) { connections[key].destroy() }
  }
}
