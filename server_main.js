const Hapi = require('@hapi/hapi');
const Ejs = require('ejs');
const Vision = require("@hapi/vision");
const Inert = require('@hapi/inert');
const Mongoose = require('mongoose');
const UserModel = require('./db_models/user_model');
const HapiCoockie = require('@hapi/cookie');
const UserModule = require('./routes/user_auth');
const PostModel = require('./routes/posts')
const ls_social_db = Mongoose.connect('mongodb+srv://ofek_regev:Dontry12@cluster0.xrbrp.mongodb.net/ls_social_db?retryWrites=true&w=majority', {
  useNewUrlParser: true
});
//Init server
const init = async () => {
  const server = new Hapi.Server({
    port: 3000,
    host: "0.0.0.0"
  });
  await server.register(require('hapi-cors'))
  await server.register([
    UserModule,
    PostModel
  ])
  await server.start();
  console.log("onServerStarted")
}
init()
