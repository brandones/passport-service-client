var async = require('async')
var httpTools = require('./http')
var authTools = require('./tools')
var authClient = require('./auth-client')

/*

---------------------------------------------

  wrap a http handler with session cookie based access control

  this means contacting the auth server
  and writing the results to req.user

  handler: the function(req, res) to call
  if the authn/authz succeeds

  opts:

   * host, port, path: where to access the auth server.
      Overrides for AUTH_SERVICE_HOST, AUTH_SERVICE_PORT, AUTH_SERVICE_PATH 
   * authorizor(req, {
      context:'session',
      loggedIn:{true,false},
      data:{
        loginPacket...
      }
     }, function(err, accessData){
  
     })


  req.user and req.accessData are populated if given
*/

function errorHandler(res, message){
  res.statusCode = 401
  res.setHeader('Content-type', 'text/plain')
  res.end(message || 'there was an error with the session login')
}

function sessionAccessControl(opts){

  opts = opts || {}
  // a user supplied function that will be provided with the
  // result of the authenticator
  var authorizor = opts.authorizor || function(req, data, done){ done() }
  // are we allowing any request through even if there is now user?
  var openAccess = opts.openAccess ? true : false

  return function(req, res, next){
    // contact the auth service to turn the cookie into a user
    // this uses the sessionClient
    authClient.getAuth(
      opts,
      { cookie: req.headers.cookie },
      httpTools.errorWrapper(res, function(loginPacket) {
        if(!loginPacket) return authTools.handleError(res, 'no login packet returned')
        // authorize the user (even if we don't have on it's up to the authz fn)
        authorizor(
          req,
          {
            context:'session',
            // we send the results from /auth/v1/status to the authorizer
            data: loginPacket
          },
          function(err, access) {
            if (err) {
              if (access=='authz') {
                return authTools.handleNoAccess(res, err)
              } else {
              // default to assuming its a no user error
                return authTools.handleNoUser(res, err)
              }
            }
            next()
          }
        )
      })
    )
  }
}

module.exports = sessionAccessControl
