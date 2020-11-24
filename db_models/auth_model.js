const Mongoose = require('mongoose');
const Shortid = require('shortid');

let authSchema = Mongoose.Schema({
  user_id: {
    type: String
  },
  auth_token: {
    type: String,
    default: Shortid.generate
  }
})
let AuthModel = Mongoose.model("Auth",authSchema);
module.exports = AuthModel
