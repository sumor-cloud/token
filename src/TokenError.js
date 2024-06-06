import defineError from '@sumor/error'

const TokenError = defineError({
  code: {
    LOGIN_EXPIRED: 'Login expired',
    PERMISSION_DENIED: 'Permission denied: {permission}'
  },
  // languages: en, zh, es, ar, fr, ru, de, pt, ja, ko
  i18n: {
    en: {
      LOGIN_EXPIRED: 'Login expired',
      PERMISSION_DENIED: 'Permission denied: {permission}'
    },
    zh: {
      LOGIN_EXPIRED: '登录已过期',
      PERMISSION_DENIED: '权限不足： {permission}'
    }
  }
})

export default TokenError
