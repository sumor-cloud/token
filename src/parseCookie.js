export default cookie => {
  cookie = cookie || ''
  let arr = cookie.split(';')
  if (arr[0] === '') {
    arr = []
  }
  return arr.reduce((acc, cookie) => {
    const [key, value] = cookie.split('=')
    acc[key.trim()] = value || null
    return acc
  }, {})
}
