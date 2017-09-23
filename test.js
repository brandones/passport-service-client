const expect = require('unexpected')
const sinon = require('sinon')
const authClient = require('./auth-client')

describe('session-access-middleware', () => {
  var sessionAccessMiddleware 
  var res

  before(() => {
    const stub = sinon.stub(authClient, "getAuth")
    stub.callsArgWith(2, { loginPacket: {} } )
    sessionAccessMiddleware = require('./session-access-middleware')
  })

  beforeEach(() => {
    res = { status: sinon.stub(), send: sinon.stub(), redirect: sinon.stub() }
    res.status.returns(res)
    res.send.returns(res)
  })

  after(() => {
    authClient.getAuth.restore()
  })

  it('returns a 3-argument function (like a piece of middleware)', () => {
    const mw = sessionAccessMiddleware()
    expect(mw, 'to be a function')
    expect(mw.length, 'to equal', 3)
  })

  it('should call next() once if check is passed', () => {
    const mw = sessionAccessMiddleware({ check: () => true })
    const nextSpy = sinon.spy()
    mw({ headers: { cookie: 'something fake' } }, res, nextSpy)
    expect(nextSpy.calledOnce, 'to be true')
  })

  it('should redirect if check is failed', () => {
    const path = '/login'
    const mw = sessionAccessMiddleware({
      check: () => false,
      failureRedirect: path
    })
    mw({ headers: { cookie: 'something fake' } }, res, () => {})
    console.log(res.status.called)
    console.log(res.send.called)
    expect(res.redirect.calledWith(path), 'to be true')
  })
})

