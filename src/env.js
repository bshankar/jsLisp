const env = {
  // arithmetic operators
  '+': args => args.reduce((a, e) => a + e),
  '-': args => args.reduce((a, e) => a - e),
  '*': args => args.reduce((a, e) => a * e),
  '/': args => args.reduce((a, e) => a / e),
  '%': args => args.reduce((a, e) => a % e),

  // comparison operators
  '<': args => args.every((e, i) => i ? args[i - 1] < e : true),
  '>': args => args.every((e, i) => i ? args[i - 1] > e : true),
  '<=': args => args.every((e, i) => i ? args[i - 1] <= e : true),
  '>=': args => args.every((e, i) => i ? args[i - 1] >= e : true),

  // quote
  // list operations
  // special forms
  'begin': args => args[args.length - 1],
  'if': args => args[0] ? args[1] : args[2]
}

const unwrap = v => v instanceof Array ? v[0] : v
const set = (k, v, env) => { env[unwrap(k)] = unwrap(v) }
const get = (k, env) => env[unwrap(k)]

module.exports = { env, set, get }
