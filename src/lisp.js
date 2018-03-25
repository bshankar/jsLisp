const { find } = require('./env')

function reParser (pattern, s, inner = x => x) {
  if (!s) return null
  if (s instanceof Array) s = s[1]
  const res = pattern.exec(s)
  return res ? [inner(res[1]), s.slice(res[0].length)] : null
}

const open = s => reParser(/^\s*(\()\s*/, s)
const close = s => reParser(/^\s*(\))\s*/, s)
const tokenParser = s => reParser(/^\s*([^\s()]+)\s*/, s, v => {
  return parseFloat(v) || v === 'true' ||
    (v === 'false' ? false : v === 'null' ? null : find(v) || v)
})

function sexpParser (s, env, ast = []) {
  let res = open(s)
  while (res) {
    res = tokenParser(res) || sexpParser(res)
    if (res) ast.push(res[0])
    const hasEnded = close(res)
    if (hasEnded) return [ast[0](ast.slice(1)), hasEnded[1]]
  }
  return null
}

module.exports = { sexpParser }
