const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  // Define header and check if it exist.
  const authHeader = req.get('Authorization')
  if (!authHeader) {
    const error = new Error('Not authenticated')
    error.statusCode = 401
    throw error
  }
  // access the user authorization header from frontend.
  const token = authHeader.split(' ')[1]
  let decodedToken
  try {
    decodedToken = jwt.verify(token, 'secret') // to decode and verify token.
    // use the same secret used in authController.
  } catch (err) {
    err.statusCode = 500
    throw err
  }
  if (!decodedToken) {
    const error = new Error('Not authenticated')
    error.statusCode = 401
    throw error
  }

  // extract token and store in userId so it can be used in other places
  req.userId = decodedToken.userId
  next()
}
