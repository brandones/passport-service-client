var jwt = require('jsonwebtoken')

const TOKEN_NAME = 'x-token-access'
/*

  inject a 'headers' object with the token header
  this will be decoded by the tokenaccess.js module on the server

  headers = injectToken(secret, data, headers)
  
  * secret - used to encode the JWT
  * data - encoded into the JWT
  * headers - existing object to write header to - created if blank

*/

function injectToken(secret, data, headers){

  headers = headers || {}
  data = data || {}

  headers[TOKEN_NAME] = jwt.sign(data, secret)

  return headers
}


/*

  extract a token from some headers using the given secret
  
*/
function extractToken(secret, headers, done){
  // get the token
  var encodedToken = headers[TOKEN_NAME]

  if(!encodedToken) return done('no token given')

  jwt.verify(encodedToken, secret, done)
}

/*

  does the given headers object have a token header in it
  
*/
function hasToken(headers){
  headers = headers || {}
  return headers[TOKEN_NAME] ? true : false
}


module.exports = {
  injectToken:injectToken,
  extractToken:extractToken,
  hasToken:hasToken,
}
