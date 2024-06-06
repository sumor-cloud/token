import Token from './Token.js'
import parseCookie from './parseCookie.js'
export default (req, res, next) => {
  const cookie = parseCookie(req.headers.cookie)
  req.token = new Token(() => {
    let existingCookie = res.getHeader('Set-Cookie') || []
    if (typeof existingCookie === 'string') {
      existingCookie = [existingCookie]
    }
    res.setHeader('Set-Cookie', [
      ...existingCookie,
      `t=${req.token.id}; Path=/; HttpOnly; Max-Age=86400`
    ])
  })
  req.token._id = cookie.t || null
  next()
}
