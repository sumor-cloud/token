import Token from './Token.js'
import parseCookie from './parseCookie.js'
export default (req, res, next) => {
  const authorization = req.headers.authorization
  if (authorization) {
    req.token = new Token()
    if (authorization.startsWith('Bearer ')) {
      req.token._id = authorization.substring(7)
    }
  } else {
    const cookie = parseCookie(req.headers.cookie)
    req.token = new Token(id => {
      let existingCookie = res.getHeader('Set-Cookie') || []
      if (typeof existingCookie === 'string') {
        existingCookie = [existingCookie]
      }
      const maxAge = 100 * 24 * 60 * 60
      res.setHeader('Set-Cookie', [
        ...existingCookie,
        `t=${id}; Path=/; HttpOnly; Max-Age=${maxAge}`
      ])
    })
    req.token._id = cookie.t || null
  }

  next()
}
