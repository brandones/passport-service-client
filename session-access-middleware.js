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

   * check: (authData) => bool || str
      A function that should return either
        - `true` (to allow access) or
        - anything else (to deny access)
      non-`true` responses will be passed to onFail

   * onFail: (req, res, err) => None
      Called when `check` returns non-`true`

   * failureRedirect: String
      Where to redirect a user on failing authentication

  req.user and req.accessData are populated if given
*/

function errorHandler(res, message){
  res.statusCode = 401
  res.setHeader('Content-type', 'text/plain')
  res.end(message || 'there was an error with the session login')
}

function sessionAccessControl(opts){

  opts = opts || {}

  function defaultCheck(authData) {
    if(!authData.data || !authData.data.loggedIn || !authData.data.user || !authData.data.user._id){
      return 'login required'
    }
    return true
  }
  var check = opts.check || defaultCheck

  function defaultOnFail(req, res, err) {
    console.log('doing defaultOnFail')
    console.log(opts.failureRedirect)
    if (opts.failureRedirect) {
      res.redirect(opts.failureRedirect)
    } else {
      res.status(403).send({'result': err})
    }
  }
  var onFail = opts.onFail || defaultOnFail

  return function(req, res, next){
    // contact the auth service to turn the cookie into a user
    // this uses the sessionClient
    authClient.getAuth(
      opts,
      { cookie: req.headers.cookie },
      httpTools.errorWrapper(res, function(loginPacket) {
        if(!loginPacket) return authTools.handleError(res, 'no login packet returned')
        var authData = {
          context:'session',
          data: loginPacket
        }
        var result = check(authData)
        if (result === true) {
          req.user = authData.data.user
          next()
        } else {
          onFail(req, res, result)
        }
      })
    )
  }
}

module.exports = sessionAccessControl
