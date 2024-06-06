import type from './type.js'
import TokenError from './TokenError.js'

export default class Token {
  constructor(saver) {
    this._id = null
    this._user = null
    this._data = null
    this._permission = {}
    this._time = 0
    this.save = () => {
      if (saver) {
        saver(this.id)
      }
    }
  }

  get id() {
    return this._id || ''
  }

  set id(id) {
    this._id = id
    this.save()
  }

  get data() {
    return this._data || {}
  }

  set data(val) {
    this._data = Object.assign({}, val)
  }

  get user() {
    return this._user || ''
  }

  set user(user) {
    this._user = user
  }

  get permission() {
    return this._permission
  }

  set permission(val) {
    const result = {}
    if (typeof val === 'string') {
      result[val] = []
    } else if (type(val) === 'array') {
      for (const item of val) {
        result[item] = []
      }
    } else if (type(val) === 'object') {
      for (const key in val) {
        if (type(val[key]) === 'array') {
          result[key] = val[key]
        } else if (type(val[key]) === 'string') {
          result[key] = [val[key]]
        } else {
          result[key] = []
        }
      }
    }
    this._permission = result
  }

  has(key, value) {
    let matched = false
    if (this._permission[key]) {
      if (value) {
        if (this._permission[key].indexOf(value) >= 0) {
          matched = true
        }
      } else {
        matched = true
      }
    }
    return matched
  }

  check(key, value) {
    if (!this.user) {
      // Check if the user is logged in
      throw new TokenError('LOGIN_EXPIRED')
    } else if (key) {
      // Check if the user has the required permission
      const lacked = !this.has(key, value)
      if (lacked) {
        const permission = value ? `${key}=${value}` : key
        throw new TokenError('PERMISSION_DENIED', { permission })
      }
    }
  }

  destroy() {
    this._id = null
    this.save()
  }
}
