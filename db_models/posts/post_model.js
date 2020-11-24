const Mongoose = require('mongoose');
const Shortid = require('shortid');
const UserModel = require('../user_model');
let authSchema = Mongoose.Schema({
  author: {
    type: UserModel.userSchema
  },
  content: {
    type: String
  },
  imageUrl: {
    type: String
  },
  creationTimeStamp: {
    type: Number,
    default: new Date().getTime()
  },
  lastEditTimeStamp : {
    type : Number
  }
})
let PostModel = Mongoose.model("Post",authSchema);
module.exports = PostModel
