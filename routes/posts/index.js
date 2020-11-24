const UserModel = require('../../db_models/user_model');
const AuthModel = require('../../db_models/auth_model');
const PostModel = require('../../db_models/posts/post_model');
const Helper = require('../../helper')
const Mongoose = require('mongoose')
module.exports.plugin = {
  pkg: require('./package.json'),
  register: (server, options, next) => {
    server.route([{
        method: "POST",
        path: "/publish",
        // handles publishing a new post
        handler: async (request, reply) => {
          console.log("publish called ");
          let authHeader = request.headers["authorization"]
          let authToken = Helper.extractTokenFromHeader(authHeader)
          // searching in the db for the session auth token
          let dbToken = await AuthModel.findOne({
            auth_token: authToken
          })
          console.log(dbToken);
          // first of all token validatiom is required
          if (!dbToken) {
            return Helper.createInvalidTokenResponse(reply)
          }

          // the pulling the details of the user who made the request by the id from the session token
          let user = await UserModel.User.findOne({
            user_id: dbToken.user_id
          }, {
            password: 0,
            __v: 0
          })
          console.log(user);
          // verifying the user exists in the db
          if (!user) {
            // user not recognized, there's something wrong with this token
            return Helper.createInvalidTokenResponse(reply)
          }
          let postContent = request.payload.content
          let post = new PostModel({
            author: user,
            content: postContent
          })
          try {
            await post.save()
          } catch (e) {
            console.error(e);
            // return an error in case the post couln't be saved in the db
            let response = reply.response("couln't save post to the server. please try again.")
            response.code(400)
            return response;
          }
          // the post is successfuly saved in the db,
          let postCopy = await PostModel.findOne({
            _id: post._id
          }, {
            __v: 0
          }).lean()
          //a copy of the created post is returned in the respose
          let response = reply.response(postCopy)
          response.code(200)
          return response;
        }
      },
      {
        method: "POST",
        path: "/edit",
        // handles publishing a new post
        handler: async (request, reply) => {
          let authHeader = request.headers["authorization"]
          let authToken = Helper.extractTokenFromHeader(authHeader)
          // searching in the db for the session auth token
          let dbToken = await AuthModel.findOne({
            auth_token: authToken
          })
          console.log(dbToken);
          // first of all token validatiom is required
          if (!dbToken) {
            return Helper.createInvalidTokenResponse(reply)
          }
          console.log(dbToken.user_id);
          // starting by verifying the editing user is the one who own the post
          let postId = request.payload.post_id
          console.log(postId);
          let dbPost = await PostModel.findOne({
            _id : Mongoose.Types.ObjectId(postId)
          }).lean()
          console.log(dbPost);
          if (!dbPost || !(dbPost.author.user_id === dbToken.user_id) ) {
            // the post doesn't exist or
            // the user is not the owner of the post. thus, changes are unauthorized
            let response = reply.response({
              message: 'Changes not authorized'
            })
            response.code(400)
            return response
          }
          // after the user is authorized as the post creator editing the post annd updating the edit timestamp
          await PostModel.updateOne({
            _id: postId
          },{
            content: request.payload.content,
            lastEditTimeStamp: new Date().getTime()
          })
          let updatedPost = await PostModel.findOne({
            _id:postId
          },{
            __v:0
          })
          let response = reply.response(updatedPost)
          response.code(200)
          return response
        }
      },
      {
        method: 'GET',
        path: '/posts',
        // handles query of the posts in db
        handler: async (request, reply) => {
          let authHeader = request.headers["authorization"]
          console.log(authHeader);
          let authToken = Helper.extractTokenFromHeader(authHeader)
          // searching in the db for the session auth token
          let dbToken = await AuthModel.findOne({
            auth_token: authToken
          })
          console.log(dbToken);
          // first of all token validatiom is required
          if (!dbToken) {
            return Helper.createInvalidTokenResponse(reply)
          }
          // index to begin with the query
          var startIndex = request.query.startIndex
          // represents how many posts to load, if 0 everything will be loaded
          let count = request.query.count
          console.log(startIndex);
          console.log(count);
          if (startIndex < 0) {
            // start index cannot be negetavie, if it was just ignore the value and start from 0
            startIndex = 0
          }
          var posts = null
          try {
            if (count > 0) {
              posts = await PostModel.find({}, {
                __v: 0
              }).skip(parseInt(startIndex)).limit(parseInt(count)).lean()
            } else {
              // if the count is equal or less than 0 all the posts will be returned
              posts = await PostModel.find({}, {
                __v: 0
              }).skip(parseInt(startIndex)).lean()
            }
            console.log(posts);
            let respose = reply.response(posts)
            respose.code(200)
            return respose
          } catch (e) {
            console.error(e);
            let respose = reply.response("failed")
            respose.code(400)
            return respose
          }
        }
      }
    ])
  }
}
