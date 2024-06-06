# token-middleware

A [Sumor Cloud](https://sumor.cloud) Tool.  
[More Documentation](https://sumor.cloud/token-middleware)
A token middleware for ExpressJS.

[![CI](https://github.com/sumor-cloud/token-middleware/actions/workflows/ci.yml/badge.svg)](https://github.com/sumor-cloud/token-middleware/actions/workflows/ci.yml)
[![Test](https://github.com/sumor-cloud/token-middleware/actions/workflows/ut.yml/badge.svg)](https://github.com/sumor-cloud/token-middleware/actions/workflows/ut.yml)
[![Coverage](https://github.com/sumor-cloud/token-middleware/actions/workflows/coverage.yml/badge.svg)](https://github.com/sumor-cloud/token-middleware/actions/workflows/coverage.yml)
[![Audit](https://github.com/sumor-cloud/token-middleware/actions/workflows/audit.yml/badge.svg)](https://github.com/sumor-cloud/token-middleware/actions/workflows/audit.yml)

## Installation

```bash
npm i @sumor/token-middleware --save
```

## Prerequisites

### Node.JS version

Require Node.JS version 16.x or above

### require Node.JS ES module

As this package is written in ES module,
please change the following code in your `package.json` file:

```json
{
  "type": "module"
}
```

## Usage

### Add token middleware to ExpressJS App

```javascript
import express from 'express'
import tokenMiddleware from '@sumor/token-middleware'

const app = express()
app.use(tokenMiddleware)

// load token
app.use(async (req, res, next) => {
  const tokenId = req.token.id
  const tokenInfo = await fetchToken(tokenId)
  req.token.user = tokenInfo.user
  req.token.data = tokenInfo.data
  req.token.permission = tokenInfo.permission
  next()
})

// set token
app.get('/login', async (req, res) => {
  const username = req.query.username
  const password = req.query.password
  req.token.id = await createToken(username, password)
  // it will automatic add token to response header cookie 't'
  res.send('Login Success')
})

// use token
app.get('/api', (req, res) => {
  // check permission
  req.token.check('AUTH1')

  res.send('Hello World')
})
```

### permission check

```javascript
// get permission
req.token.permission = {
  AUTH1: ['READ', 'WRITE'],
  AUTH2: ['READ']
}
const hasAuth1 = req.token.has('AUTH1') // true
const hasAuth2 = req.token.has('AUTH2') // true
const hasAuth3 = req.token.has('AUTH3') // false

const hasAuth1Read = req.token.has('AUTH1', 'READ') // true
const hasAuth1Write = req.token.has('AUTH1', 'WRITE') // true
const hasAuth2Read = req.token.has('AUTH2', 'READ') // true
const hasAuth2Write = req.token.has('AUTH2', 'WRITE') // false

// check permission
req.token.check('AUTH1') // pass
req.token.check('AUTH2') // pass
req.token.check('AUTH3') // throw Error PERMISSION_DENIED Permission denied: AUTH3
req.token.check('AUTH1', 'READ') // pass
req.token.check('AUTH1', 'WRITE') // pass
req.token.check('AUTH2', 'READ') // pass
req.token.check('AUTH2', 'WRITE') // throw Error PERMISSION_DENIED Permission denied: AUTH2=WRITE
```
