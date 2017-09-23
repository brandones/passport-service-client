function getConfig(opts) {
  opts = opts || {}
  var res = {
    host: opts.host || process.env.AUTH_SERVICE_HOST || 'localhost',
    port: opts.port || process.env.AUTH_SERVICE_PORT || 80,
    path: opts.path || process.env.AUTH_SERVICE_PATH || '/auth/v1'
  }
  return res
}

module.exports = getConfig

