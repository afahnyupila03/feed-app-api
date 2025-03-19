const express = require('express')
const { check, body } = require('express-validator')
const router = express.Router()

const User = require('../models/user')

const authController = require('../controllers/auth')

router.put(
  '/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      // Check for existing user.
      .custom((value, { req }) => {
        return User.findOne({ email: value })
          .then(user => {
            if (user) {
              return Promise.reject('User with email already exists.')
            }
          })
          .catch(err => {
            console.error('EXISTING_EMAIL_ERROR: ', err)
            if (!err.statusCode) err.statusCode = 500
            throw err // Ensure the error is properly thrown
          })
      })

      .normalizeEmail(),
    body('password').trim().isLength({ min: 5 }),
    body('name').trim().isLength({ min: 5 })
  ],
  authController.signup
)
router.post('/login', authController.login)

module.exports = router
