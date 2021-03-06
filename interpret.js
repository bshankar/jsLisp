const lispParser = require('./parse').lispParser

function standardEnv () {
  const env = new Env()

  // keywords
  env['begin'] = args => args[args.length - 1]
  env['display'] = args => console.log(args[0])

  // list functions
  env['list'] = args => args
  env['car'] = args => args[0][0]
  env['cdr'] = args => args[0].slice(1)
  env['cons'] = args => [args[0]].concat(args[1])
  env['reverse'] = args => args[0].reverse()

  // arithmetic functions
  env['+'] = args => args.reduce((sum, e) => sum + e)
  env['-'] = args => args.reduce((diff, e) => diff - e)
  env['*'] = args => args.reduce((mult, e) => mult * e)
  env['/'] = args => args.reduce((div, e) => div / e)
  env['%'] = args => args.reduce((div, e) => div % e)

  // comparision functions
  env['>'] = args => args[0] > args[1]
  env['<'] = args => args[0] < args[1]
  env['>='] = args => args[0] >= args[1]
  env['<='] = args => args[0] <= args[1]
  env['='] = args => args[0] === args[1]

  // load math functions
  const mathFuns = Object.getOwnPropertyNames(Math)
  for (let i in mathFuns) {
    env[mathFuns[i]] = args => Math[mathFuns[i]](...args)
  }
  return env
}

function Procedure (params, body, env) {
  this.params = params
  this.body = body
  this.env = env
}

Procedure.prototype.call = function () {
  if (this.body[0] instanceof Array) {
    for (let i = 0; i < this.body.length - 1; ++i) {
      evalTree(this.body[i], this.env)
    }
    return evalTree(this.body[this.body.length - 1], this.env)
  } else return evalTree(this.body, this.env)
}

function Env (params, args, outer) {
  if (!params) params = []
  if (!args) args = []
  if (!outer) outer = null

  for (let i = 0; i < params.length; ++i) {
    this[params[i]] = args[i]
  }
  this.outer = outer
}

Env.prototype.find = function (v) {
  if (v in this) return this
  return this.outer.find(v)
}

function evalTree (x, env) {
  if (!env) env = standardEnv()
  if (x === null) return null

  if (typeof x === 'string' && x[0] !== "'") return env.find(x)[x]
  else if (!(x instanceof Array)) return x
  else if (x[0] === 'define') env[x[1]] = evalTree(x[2], env)
  else if (x[0] === 'set!') env.find(x[1])[x[1]] = evalTree(x[2], env)
  else if (x[0] === 'if') {
    if (evalTree(x[1], env)) return evalTree(x[2], env)
    if (x.length > 3) return evalTree(x[3], env)
  } else if (x[0] === 'lambda') {
    return new Procedure(x[1], x.slice(2))
  } else {
    const proc = evalTree(x[0], env)
    const args = []
    for (let i = 1; i < x.length; ++i) {
      args.push(evalTree(x[i], env))
    }
    if (proc instanceof Procedure) {
      proc.env = new Env(proc.params, args, env)
      return proc.call()
    }
    if (proc !== undefined) return proc(args)
  }
}

function evalLisp (s) {
  const x = lispParser(s)[0]
  return evalTree(x)
}

// test a file
const fs = require('fs')
const filename = process.argv[2]
fs.readFile(filename, 'utf-8', function (err, s) {
  if (err) throw err

  const util = require('util')
  console.log('AST: \n', util.inspect(lispParser(s)[0], false, null))
  let result = evalLisp(s)
  console.log('\nResult: \n', util.inspect(result, false, null))
})
