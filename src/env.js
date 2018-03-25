const env = {
  '+': args => args.reduce((a, e) => a + e),
  '-': args => args.reduce((a, e) => a - e),
  '*': args => args.reduce((a, e) => a * e),
  '/': args => args.reduce((a, e) => a / e),
  '<': args => args.every((e, i) => i ? args[i - 1] < e : true),
  '>': args => args.every((e, i) => i ? args[i - 1] > e : true),
  '<=': args => args.every((e, i) => i ? args[i - 1] <= e : true),
  '>=': args => args.every((e, i) => i ? args[i - 1] >= e : true),
  'begin': args => args[args.length - 1],
  'define': args => { this[args[0]] = args[1] }
}

const find = v => v instanceof Array ? env[v[0]] : env[v]

module.exports = { env, find }
