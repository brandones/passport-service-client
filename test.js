const expect = require('unexpected')
const sinon = require('sinon')
const authClient = require('./auth-client')

describe('session-access-middleware', () => {
  var sessionAccessMiddleware 

  before(() => {
    const stub = sinon.stub(authClient, "getAuth")
    stub.callsArgWith(2, undefined, { loginPacket: {} } )
    sessionAccessMiddleware = require('./session-access-middleware')
  })

  after(() => {
    authClient.getAuth.restore()
  })

  it('returns a 3-argument function (like a piece of middleware)', () => {
    const mw = sessionAccessMiddleware()
    expect(mw, 'to be a function')
    expect(mw.length, 'to equal', 3)
  })

  it('should call next() once', function() {
    const mw = sessionAccessMiddleware()
    const nextSpy = sinon.spy()
    mw({ headers: { cookie: 'something fake' } }, {}, nextSpy)
    expect(nextSpy.calledOnce, 'to be true')
  })
})

