export default value => {
  let type = typeof value
  if (value === null) {
    type = 'null'
  } else if (type === 'object') {
    const objType = Object.prototype.toString.call(value)
    if (objType === '[object Array]') {
      type = 'array'
    } else if (objType === '[object RegExp]') {
      type = 'regexp'
    }
  }
  return type
}
