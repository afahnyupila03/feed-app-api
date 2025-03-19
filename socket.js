const { Server } = require('socket.io')

let io

module.exports = {
  init: httpServer => {
    if (!io) {
      // Ensure init is only called once.
      io = new Server(httpServer, {
        cors: {
          origin: 'http://localhost:3000',
          methods: ['GET', 'POST', 'PUT', 'DELETE']
        }
      })
      console.log('Socket.io initialized')
    }

    return io
  },
  getIo: () => {
    if (!io) {
      throw new Error('Socket.io not initialized')
    }
    return io
  }
}
