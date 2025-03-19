const mongoose = require('mongoose')
const Schema = mongoose.Schema

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    // image: {
    //   type: String,
    //   required: true
    // },
    content: {
      type: String,
      required: true
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true } // Mongoose will automatically add timestamps to newly createdAt / updatedAt objects.
)

module.exports = mongoose.model('Post', postSchema)
