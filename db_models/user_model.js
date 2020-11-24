const Mongoose = require('mongoose');
const Shortid = require('shortid');
let userSchema = Mongoose.Schema({
  name: {
    type: String
  },
  email: {
    type: String
  },
  password: {
    type: String
  },
  // unique id generated for each user
  user_id: {
    type: String,
    default: Shortid.generate
  },
});
let User = Mongoose.model("User",userSchema);
module.exports.User = User;
module.exports.userSchema = userSchema;
