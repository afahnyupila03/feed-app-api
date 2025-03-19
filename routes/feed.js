const express = require('express')

const feedController = require('../controllers/feed')
const { check, body } = require('express-validator')
const isAuth = require('../middleware/isAuth')

const router = express.Router()

// GET /feed/posts
router.get('/posts', isAuth, feedController.getPosts)

// POST /feed/post
router.post(
  '/post',
  isAuth,
  [body('title').trim().isLength({ min: 5 }), body('content').trim()],
  feedController.createPost
)

router.get('/post/:postId', isAuth, feedController.getPost)

router.put('/post/:postId', isAuth, feedController.updatePost)

router.delete('/post/:postId', isAuth, feedController.deletePost)

module.exports = router
