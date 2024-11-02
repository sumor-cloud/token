// port number prefix is 402

import { describe, expect, it } from '@jest/globals'
import createApp from '@sumor/ssl-server'
import axios from 'axios'
// import https from 'https'

import type from '../src/type.js'
import parseCookie from '../src/parseCookie.js'
import Token from '../src/Token.js'
import middleware from '../src/index.js'

const port1 = 40200
const port2 = 40201
describe('Main', () => {
  it('type', () => {
    expect(type('abc')).toBe('string')
    expect(type(123)).toBe('number')
    expect(type(true)).toBe('boolean')
    expect(type(null)).toBe('null')
    expect(type([])).toBe('array')
    expect(type(/abc/)).toBe('regexp')
    expect(type({})).toBe('object')
    expect(type(undefined)).toBe('undefined')
    expect(type(null)).toBe('null')
  })
  it('parse cookie', () => {
    const cookie1 = parseCookie()
    expect(cookie1).toEqual({})

    const cookie2 = parseCookie('t=123')
    expect(cookie2).toEqual({
      t: '123'
    })

    const cookie3 = parseCookie('t=123;o=222')
    expect(cookie3).toEqual({
      t: '123',
      o: '222'
    })

    const cookie4 = parseCookie('t=123; o=222')
    expect(cookie4).toEqual({
      t: '123',
      o: '222'
    })

    const cookie5 = parseCookie('t=123; o=')
    expect(cookie5).toEqual({
      t: '123',
      o: null
    })

    const cookie6 = parseCookie('t=123; o')
    expect(cookie6).toEqual({
      t: '123',
      o: null
    })
  })
  it('Token', async () => {
    let tokenId
    const saver = id => {
      tokenId = id
    }
    const token = new Token(saver)

    expect(token.id).toBe('') // default is ''
    token.id = 'abc'
    expect(tokenId).toBe('abc') // save id
    token.destroy()
    expect(tokenId).toBe('') // destroy id

    expect(token.data).toEqual({}) // default is {}
    token.data = { a: 1 }
    expect(token.data).toEqual({ a: 1 }) // set data

    expect(token.user).toBe('') // default is ''
    token.user = 'USER1'
    expect(token.user).toBe('USER1') // set user

    expect(token.permission).toEqual({}) // default is {}
    token.permission = {
      AUTH1: ['a'],
      AUTH2: 'b',
      AUTH3: {}
    }
    expect(token.permission).toEqual({
      AUTH1: ['a'],
      AUTH2: ['b'],
      AUTH3: []
    })

    token.permission = ['AUTH1', 'AUTH2']
    expect(token.permission).toEqual({
      AUTH1: [],
      AUTH2: []
    })

    token.permission = 'AUTH1'
    expect(token.permission).toEqual({
      AUTH1: []
    })

    token.permission = function () {}
    expect(token.permission).toEqual({})

    const token2 = new Token()
    token2.id = 'bcd'
    expect(token2.id).toBe('bcd')
    expect(tokenId).toBe('')
  })

  it('token permission has', () => {
    const token = new Token()
    token.permission = ['AUTH1']
    expect(token.has('AUTH1')).toBe(true)
    expect(token.has('AUTH2')).toBe(false)

    token.permission = {
      AUTH1: ['a'],
      AUTH2: 'b',
      AUTH3: {}
    }
    expect(token.has('AUTH1', 'a')).toBe(true)
    expect(token.has('AUTH1', 'b')).toBe(false)
    expect(token.has('AUTH2', 'b')).toBe(true)
    expect(token.has('AUTH2', 'a')).toBe(false)
    expect(token.has('AUTH3')).toBe(true)
    expect(token.has('AUTH3', 'a')).toBe(false)
  })

  it('token permission check', () => {
    const token = new Token()
    let error1
    try {
      token.check()
    } catch (e) {
      error1 = e
    }
    expect(error1).toBeInstanceOf(Error)
    expect(error1.code).toBe('LOGIN_EXPIRED')
    expect(error1.message).toBe('Login expired')
    error1.language = 'zh-CN'
    expect(error1.message).toBe('登录已过期')

    token.id = 'abc'
    token.user = 'USER1'
    token.permission = ['AUTH1']
    let error2

    // check login
    try {
      token.check()
    } catch (e) {
      error2 = e
    }
    expect(error2).toBe(undefined)

    try {
      token.check('AUTH1')
    } catch (e) {
      error2 = e
    }
    expect(error2).toBe(undefined)

    try {
      token.check('AUTH2')
    } catch (e) {
      error2 = e
    }
    expect(error2).toBeInstanceOf(Error)
    expect(error2.code).toBe('PERMISSION_DENIED')
    expect(error2.message).toBe('Permission denied: AUTH2')
    error2.language = 'zh-CN'
    expect(error2.message).toBe('权限不足： AUTH2')

    token.permission = {
      AUTH1: ['a']
    }

    let error3
    try {
      token.check('AUTH1', 'a')
    } catch (e) {
      error3 = e
    }
    expect(error3).toBe(undefined)
    try {
      token.check('AUTH1', 'b')
    } catch (e) {
      error3 = e
    }
    expect(error3).toBeInstanceOf(Error)
    expect(error3.code).toBe('PERMISSION_DENIED')
    expect(error3.message).toBe('Permission denied: AUTH1=b')
    error3.language = 'zh-CN'
    expect(error3.message).toBe('权限不足： AUTH1=b')
  })
  it('load token', async () => {
    const app = await createApp()
    app.use(middleware)

    app.get('/existToken', async (req, res) => {
      const id = req.token.id
      res.send(typeof id)
    })

    app.get('/getTokenId', async (req, res) => {
      res.send(req.token.id)
    })

    app.get('/setToken1', async (req, res) => {
      res.setHeader('Set-Cookie', 'o=123; Path=/; HttpOnly; Max-Age=8640000')
      req.token.id = req.query.code

      res.send('OK')
    })

    app.get('/setToken2', async (req, res) => {
      res.setHeader('Set-Cookie', [
        'o=123; Path=/; HttpOnly; Max-Age=8640000',
        'k=sss; Path=/; HttpOnly; Max-Age=8640000'
      ])
      req.token.id = req.query.code

      res.send('OK')
    })

    app.get('/setToken3', async (req, res) => {
      req.token.id = req.query.code

      res.send('OK')
    })

    await app.listen(null, port1)

    const response1 = await axios({
      method: 'get',
      url: `http://localhost:${port1}/existToken`
      // httpsAgent: new https.Agent({ rejectUnauthorized: false })
    })
    expect(response1.data).toBe('string')

    const response2 = await axios({
      method: 'get',
      url: `http://localhost:${port1}/getTokenId`,
      // httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      headers: {
        Cookie: 't=a123'
      }
    })
    expect(response2.data).toBe('a123')

    const response3 = await axios({
      method: 'get',
      url: `http://localhost:${port1}/getTokenId`,
      // httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      headers: {
        cookie: 't=a123; o=a234'
      }
    })
    expect(response3.data).toBe('a123')
    expect(response3.headers['set-cookie']).toBeUndefined()

    const response4 = await axios({
      method: 'get',
      url: `http://localhost:${port1}/setToken1?code=567`
      // httpsAgent: new https.Agent({ rejectUnauthorized: false })
    })
    expect(response4.data).toBe('OK')
    console.log(response4.headers['set-cookie'])
    expect(
      response4.headers['set-cookie'].indexOf('o=123; Path=/; HttpOnly; Max-Age=8640000') >= 0
    ).toEqual(true)
    expect(
      response4.headers['set-cookie'].indexOf('t=567; Path=/; HttpOnly; Max-Age=8640000') >= 0
    ).toEqual(true)

    const response5 = await axios({
      method: 'get',
      url: `http://localhost:${port1}/setToken2?code=567`
      // httpsAgent: new https.Agent({ rejectUnauthorized: false })
    })
    expect(response5.data).toBe('OK')
    console.log(response5.headers['set-cookie'])
    expect(
      response5.headers['set-cookie'].indexOf('o=123; Path=/; HttpOnly; Max-Age=8640000') >= 0
    ).toEqual(true)
    expect(
      response5.headers['set-cookie'].indexOf('k=sss; Path=/; HttpOnly; Max-Age=8640000') >= 0
    ).toEqual(true)
    expect(
      response5.headers['set-cookie'].indexOf('t=567; Path=/; HttpOnly; Max-Age=8640000') >= 0
    ).toEqual(true)

    const response6 = await axios({
      method: 'get',
      url: `http://localhost:${port1}/setToken3?code=567`
      // httpsAgent: new https.Agent({ rejectUnauthorized: false })
    })
    expect(response6.data).toBe('OK')
    console.log(response6.headers['set-cookie'])
    expect(
      response5.headers['set-cookie'].indexOf('t=567; Path=/; HttpOnly; Max-Age=8640000') >= 0
    ).toEqual(true)

    await app.close()
  })
  it(
    'Authorization header',
    async () => {
      const app = await createApp()
      app.use(middleware)

      app.get('/getToken', async (req, res) => {
        return res.send(req.token.id)
      })

      await app.listen(null, port2)

      const tokenId = 'A123'
      const response = await axios({
        method: 'get',
        url: `http://localhost:${port2}/getToken`,
        // httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        headers: {
          Authorization: `Bearer ${tokenId}`
        }
      })
      await app.close()
      expect(response.data).toBe(tokenId)
    },
    20 * 1000
  )
})
