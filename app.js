const express = require('express')

const { createServer } = require('http')
const { Server } = require('socket.io')

// import socket object from socket config file.
const socket = require('./socket')

const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const path = require('path')
const multer = require('multer')

const feedRoutes = require('./routes/feed')
const authRoutes = require('./routes/auth')

const app = express()

// Socket.io connection establishment.
const httpServer = createServer(app)
// Initialize socket.io
socket.init(httpServer)

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images')
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true)
  } else {
    cb(null, false)
  }
}

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()) // application/json
app.use(
  multer({
    storage: fileStorage,
    fileFilter: fileFilter
  }).single('image')
)
app.use('/images', express.static(path.join(__dirname, 'images')))

// CORS Middleware.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  )
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
})

app.use(express.json())
app.use('/auth', authRoutes)
app.use('/feed', feedRoutes)

// Error handling middleware
app.use((error, req, res, next) => {
  const status = error.statusCode || 500
  const message = error.message
  const data = error.data
  console.log(
    'ERROR_MIDDLEWARE_MESSAGE: ',
    message,
    'ERROR_MIDDLEWARE_STATUS',
    status
  )
  res.status(status).json({ message: message, data: data })
})

const URL = 'mongodb://localhost:27017/messages'
mongoose
  .connect(URL)
  .then(() => {
    // app.listen(8080)
    // Setup socket.io connection.
    // const io = require('socket.io')(server)
    // io.on('connection', socket => {
    //   console.log('Client connected')
    // })
    console.log('MongoDB connected successfully.')

    httpServer.listen(
      8080,
      () =>{
        // io connection.
       const io = socket.getIo()
       io.on('connection', socket => {
        console.log('Client connected')
       })
      }
    )
  })
  .catch(err => console.error('error starting app: ', err))
