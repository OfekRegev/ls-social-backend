const AuthModel = require('./db_models/auth_model');
exports.extractTokenFromHeader = (authHeader) => {
  // first checking for existing login token
  if (authHeader && authHeader.includes("Bearer")) {
    // extracting the token out of the header value
    let authToken = authHeader.split(' ')[1]
    return authToken
  }
  return null
}

exports.createInvalidTokenResponse = (reply) => {
  const response = reply.response({
    errorCode: 0,
    message: "Auth Token invalid"
  });
  response.code(401);
  return response
}
