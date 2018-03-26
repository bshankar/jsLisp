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
  'define': function (args) { this[args[0]] = args[1] },
  'if': args => args[0] ? args[1] : args[2]
}

env.define = env.define.bind(env)
const find = v => v instanceof Array ? env[v[0]] : env[v]

module.exports = { env, find }
