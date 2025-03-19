const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../models/user')

exports.signup = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const error = new Error(
      'Auth validation failed, please enter valid credentials'
    )
    error.statusCode = 422
    error.data = errors.array()
    throw error
  }

  const email = req.body.email
  const password = req.body.password
  const name = req.body.name

  bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        name: name
      })

      return user.save()
    })
    .then(result => {
      res.status(201).json({
        message: 'User created',
        user: result
      })
    })
    .catch(err => {
      if (!err.statusCode) err.statusCode = 500
      res.json({
        message: err
      })
      next(err)
    })
}

exports.login = (req, res, next) => {
  const email = req.body.email
  const password = req.body.password

  let loadedUser

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        const error = new Error('No user with email found.')
        error.statusCode = 401
        throw error
      }
      loadedUser = user
      // compare existing password with extracted password.
      return bcrypt.compare(password, user.password)
    })
    .then(isEqual => {
      if (!isEqual) {
        const error = new Error('Wrong password')
        error.statusCode = 401
        throw error
      }
      // If passwords match, generate json-web token
      const token = jwt.sign(
        {
          // creates a new signature and packs it into a web token.
          // data added to the token depends on you writing the code.
          email: loadedUser.email,
          userId: loadedUser._id.toString()
        },
        // Secret, private key used for signing.
        // check jwt to learn more about secrets (jwt.io).
        'secret',
        // set token expiration time.
        { expiresIn: '1hr' }
      )
      res.status(200).json({
        message: 'User login success',
        token: token,
        user: loadedUser,
        userId: loadedUser._id
      })
    })
    .catch(err => {
      if (!err.statusCode) err.statusCode = 500
      next(err)
    })
}
