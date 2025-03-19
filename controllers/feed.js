const { validationResult } = require('express-validator')

const Post = require('../models/post')
const User = require('../models/user')

const fs = require('fs')
const path = require('path')

exports.getPosts = (req, res, next) => {
  Post.find()
    .populate('creator')
    .sort({ createdAt: -1 }) // Sort all post in descending order using the createdAt.
    .then(results => {
      res.status(200).json({
        posts: results
      })
    })
    .catch(err => {
      if (!err.statusCode) err.statusCode = 404
      next(err)
    })
}

exports.createPost = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect')
    error.statusCode = 422
    throw error
  }

  // if (!req.file) {
  //   const error = new Error('No image provided')
  //   error.statusCode = 422
  //   // throw error
  //   next()
  // }

  const title = req.body.title
  const content = req.body.content
  // const imageUrl = req.file.path

  const userId = req.userId

  let creator

  const post = new Post({
    title: title,
    content: content,
    // image: imageUrl,
    creator: userId
  })
  post
    .save()
    .then(() => {
      // Add post to the list of post for given user.
      return User.findById(userId)
    })
    .then(user => {
      creator = user
      user.post.push(post)
      return user.save()
    })
    .then(result => {
      // Lazy load socket.io to avoid not initialized error.
      const io = require('../socket').getIo()
      // Read on socket.io methods.
      io.emit('posts', {
        action: 'create',
        post: {
          ...post._doc,
          creator: {
            _id: req.userId
            // name: result.creator.name
          }
        }
      })
      res.status(201).json({
        message: 'Post created successfully!',
        post: result,
        creator: {
          id: creator._id,
          name: creator.name
        }
      })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500
        next(err)
      }
    })
}

exports.getPost = (req, res, next) => {
  const postId = req.params.postId
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Post could not be found.')
        error.statusCode = 404
        throw error
      }

      res.status(200).json({
        message: 'Post fetched success.',
        post: post
      })
    })
    .catch(err => {
      if (!err.statusCode) err.statusCode = 500
      next(err)
    })
}

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId

  const title = req.body.title
  const content = req.body.content
  let imageUrl = req.body.image
  if (req.file) imageUrl = req.file.path

  if (!imageUrl) {
    const error = new Error('No image file selected, please select one.')
    error.statusCode = 422
    throw error
  }

  if (!postId) {
    const error = new Error('Post not found')
    error.statusCode = 404
    throw error
  }

  Post.findById(postId)
    .populate('creator')
    .then(data => {
      if (!data) {
        const error = new Error('Post not found')
        error.statusCode = 404
        throw error
      }

      // check if postId belongs to userId
      if (data.creator.toString() !== req.userId) {
        const error = new Error('Not authorized to update product')
        error.statusCode = 403
        throw error
      }

      if (imageUrl !== data.image) clearImage(data.image)

      data.title = title
      data.content = content
      data.image = imageUrl

      return data.save()
    })
    .then(result => {
      const io = require('../socket').getIo()
      io.emit('posts', {
        action: 'update',
        post: result
      })
      console.log('UPDATED_POST: ', result)
      res.status(200).json({
        message: 'Post updated.!',
        post: result
        // creatorL {  } // add creator object as in createPost api.
      })
    })
    .catch(err => {
      if (!err.statusCode) err.statusCode = 500
      next(err)
    })
}
const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath)
  fs.unlink(filePath, err => console.error('error deleting image: ', err))
}

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId

  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Product to be deleted not found')
        error.statusCode = 404
        throw error
      }

      // check if postId belongs to userId
      if (data.creator.toString() !== req.userId) {
        const error = new Error('Not authorized to update product')
        error.statusCode = 403
        throw error
      }

      return Post.findByIdAndDelete(postId)
    })
    .then(() => {
      return User.findById(req.userId)
    })
    // Clear user - post relation.

    .then(user => {
      user.post.pull(postId)
      return user.save()
    })
    .then(result => {
      const io = require('../socket').getIo()
      io.emit('posts', {
        action: 'delete',
        post: result
      })
      res.status(200).json({
        message: 'Post delete complete.',
        post: result
      })
    })
    .catch(err => {
      if (!err.statusCode) err.statusCode = 500
      next(err)
    })
}
