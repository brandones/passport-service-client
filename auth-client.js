var request = require('request')
var config = require('./config')

/*

fn(credentials, callback)

  opts:

   * host, port, path: where to access the auth server

  credentials:

   * cookie - the cookie header passed by the client request

  if credentials is a string it is assumed to be:

  {
    cookie:<value>
  }
  
*/

function getAuth(opts, credentials, done) {
  var conf = config(opts)
  credentials = credentials || {}

  if(typeof(credentials)=='string'){
    credentials = {
      cookie:credentials
    }
  }
  var uri = "http://" + conf.host + ":"+ conf.port + conf.path
  request({
    uri: uri,
    method: "GET",
    headers:{
      'cookie': credentials.cookie,
      'Content-type': 'application/json'
    }
  }, function(err, resp){
    if(err) return done('Request to ' + uri + ' failed with\n' + err.toString())
    done(null, resp.body)
  })
}

module.exports.getAuth = getAuth
