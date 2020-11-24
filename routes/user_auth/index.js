const UserModel = require('../../db_models/user_model');
const AuthModel = require('../../db_models/auth_model');
const Helper = require('../../helper')
module.exports.plugin = {
  pkg: require('./package.json'),
  register: function(server, options, next) {
    // creating a route for sign-up request
    server.route([{
        method: "POST",
        path: "/register",
        handler: async function(request, reply) {
          // first we need to validate the user is not already registered by checking whether the email is already in our database
          let existing_user = await UserModel.User.findOne({
            "email": request.payload.email
          });
          if (existing_user) {
            console.log("user already exist");
            const response = reply.response({
              message: "This email has already registered for ls-social account, Please try again with another email"
            });
            response.code(400);
            return response;
          } else {
            // validating the user saved to the db successfuly
            try {
              // saving the user to the database
              let user = new UserModel.User({
                email: request.payload.email,
                name: request.payload.name,
                password: request.payload.password,
              })
              await user.save();
              let auth_model = new AuthModel({
                user_id: user.user_id
              })
              await auth_model.save()
              // successfuly saved the user details in the db. the user is now signed up
              const response = reply.response({
                message: "Successfuly signed up!",
                auth_token: auth_model.auth_token
              });
              response.code(200);
              return response;
            } catch (e) {
              console.error(e);
              // the user didn't save in the databbase, reply an error response
              console.log("user add failed");
              const response = reply.response({
                message: "Error during signing up"
              });
              response.code(400);
              return response;
            }

          }
        }
      },
      // login route
      {
        method: "POST",
        path: "/login",

        handler: async function(request, reply) {
          let authHeader = request.headers["authorization"]
          let authToken = Helper.extractTokenFromHeader(authHeader)
          // searching in the db for the session auth token
          let dbToken = await AuthModel.findOne({
            auth_token: authToken
          })
          if (dbToken) {
            // if the token is valid the user is automatically logged in
            const response = reply.response({
              message: "Welcome to LSocial"
            })
            response.code(200)
            // response.redirect("/feed")
            return response;
          }
          console.log(request.payload);
          console.log(request.payload.email);
          let user = await UserModel.User.findOne({
            "email": request.payload.email,
            "password": request.payload.password
          })
          if (user) {
            try {
              // this user is in the system and the password is valid
              // creating a new token in the sessions
              let auth_model = new AuthModel({
                user_id: user.user_id
              })
              await AuthModel.deleteOne({
                user_id: user.user_id
              })
              await auth_model.save()
              const response = reply.response({
                message: "Welcome to LSocial",
                auth_token: auth_model.auth_token
              })
              response.code(200)
              // response.redirect("/feed")
              return response;
            } catch (e) {
              console.error(e);
              const response = reply.response({
                message: "Login failed. something went wrong."
              });
              response.code(400);
              return response
            }
          } else {
            // this user is not in the system
            const response = reply.response({
              message: "Login failed. Incorrect username or password."
            });
            response.code(400);
            return response;
          }
        }
      }
    ]);
  }
}
