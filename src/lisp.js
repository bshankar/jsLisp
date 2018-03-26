const { set, get } = require('./env')

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
    (v === 'false' ? false : v === 'null' ? null : v)
})

function sexpParser (s, env, pause = false, ast = []) {
  let res = open(s)
  while (res) {
    res = tokenParser(res) || lambdaParser(res) || sexpParser(res, env, pause)
    if (res) ast.push(res[0])
    const hasEnded = close(res)
    if (hasEnded) {
      return pause ? [ast, hasEnded[1]]
        : evaluate(ast, env, hasEnded[1])
    }
  }
  return null
}

function lambdaParser (s, env) {
  const ast = sexpParser(s, env, true)
  return (ast && ast[0][0] === 'lambda') ? [{
    params: ast[0][1],
    body: ast[0][2]
  }, ast[1]] : null
}

function evaluate (ast, env, rest) {
  if (ast[0] === 'define' && ast.length === 3) {
    return [set(ast[1], ast[2], env), rest]
  } else if (typeof ast[0] === 'string') {
    const fun = get(ast[0], env)
    const args = ast.slice(1).map(x => get(x, env) || x)
    return fun ? [fun(args), rest] : null
  } else if (ast[0] && ast[0].params && ast[0].body) {
    ast[0].params.forEach((x, i) => set(x, ast[1 + i], env))
    return evaluate(ast[0].body, env, rest)
  }
  return null
}

module.exports = { sexpParser }
