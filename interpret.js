const lispParser = require('./parse').lispParser

function standardEnv () {
  const env = new Env()

  // keywords
  env['begin'] = (args) => args[args.length - 1]
  env['define'] = function (args) { env[args[0]] = args[1] }
  env['if'] = (args) => args[0] ? args[1] : args[2]
  env['lambda'] = function (args) {
    const p = new Procedure(args.slice(0, args.length - 1), args[args.length - 1].slice(1))
    return p
  }

  // list functions
  env['list'] = (args) => new Array(args)
  env['car'] = (args) => args[0][0]
  env['cdr'] = (args) => new Array(args[0][0].slice(1))
  env['cons'] = (args) => new Array([args[0]].concat(args[1][0]))

  // arithmetic functions
  env['+'] = (args) => args.reduce((sum, e) => sum + e)
  env['-'] = (args) => args.reduce((diff, e) => diff - e)
  env['*'] = (args) => args.reduce((mult, e) => mult * e)
  env['/'] = (args) => args.reduce((div, e) => div / e)
  env['%'] = (args) => args.reduce((div, e) => div % e)

  // comparision functions
  env['>'] = (args) => args[0] > args[1]
  env['<'] = (args) => args[0] < args[1]
  env['>='] = (args) => args[0] >= args[1]
  env['<='] = (args) => args[0] <= args[1]
  env['='] = (args) => args[0] === args[1]

  // load math functions
  // const mathFuns = Object.getOwnPropertyNames(Math)
  // for (let i in mathFuns) {
    // env[mathFuns[i]] = Math[mathFuns[i]]
  // }
  return env
}

function Procedure (params, body, env) {
  this.params = params
  this.body = body
  this.env = env
}

Procedure.prototype.call = function () {
  this.body = lispParser(this.body)[0]
  return evalTree(this.body, this.env)
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
  if (v in this) return this[v]
  if (this.outer) return this.outer.find(v)
  return null
}

function evalTree (parseTree, env) {
  if (!env) env = standardEnv()
  if (!parseTree) return null

  if (parseTree[0] instanceof Array) {
    const p = new Procedure()
    p.params = parseTree[0].slice(1, parseTree[0].length - 1)
    p.body = parseTree[0].slice(-1)[0].slice(1)
    p.env = new Env(p.params, parseTree.slice(1), env)
    return p.call()
  }

  for (let i = 1; i < parseTree.length; ++i) {
    if (env.find(parseTree[i])) {
      parseTree[i] = env.find(parseTree[i])
    } else if (parseTree[i] instanceof Array) {
      parseTree[i] = evalTree(parseTree[i], env)
    }
  }
  if (env.find(parseTree[0]) instanceof Procedure) {
    const p = env.find(parseTree[0])
    p.env = new Env(p.params, parseTree.slice(1), env)
    return p.call()
  }
  return env.find(parseTree[0])(parseTree.slice(1))
}

function evalLisp (s) {
  const parseTree = lispParser(s)[0]
  return evalTree(parseTree)
}

// test a file
const fs = require('fs')
const util = require('util')
const filename = process.argv[2]
fs.readFile(filename, 'utf-8', function (err, s) {
  if (err) throw err
  let result = evalLisp(s)
  console.log(result)
})
