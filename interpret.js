const lispParser = require('./parse').lispParser

const defaultEnv = {
  // keywords
  'begin': (args) => args[args.length - 1],
  'define': function (args) { defaultEnv[args[0]] = args[1] },
  'if': (args) => args[0] ? args[1] : args[2],

  // list functions
  'list': (args) => new Array(args),
  'car': (args) => args[0][0],
  'cdr': (args) => new Array(args[0][0].slice(1)),
  'cons': (args) => new Array([args[0]].concat(args[1][0])),

  // arithmetic functions
  '+': (args) => args.reduce((sum, e) => sum + e),
  '-': (args) => args.reduce((diff, e) => diff - e),
  '*': (args) => args.reduce((mult, e) => mult * e),
  '/': (args) => args.reduce((div, e) => div / e),

  // comparision functions
  '>': (args) => args[0] > args[1],
  '<': (args) => args[0] < args[1],
  '>=': (args) => args[0] >= args[1],
  '<=': (args) => args[0] <= args[1],
  '=': (args) => args[0] === args[1]
}

// load the functions in math object into defaultEnv
const mathFuns = Object.getOwnPropertyNames(Math)
for (let i in mathFuns) {
  defaultEnv[mathFuns[i]] = Math[mathFuns[i]]
}

function evalLisp (s) {
  const parseTree = lispParser(s)[0]
  return evalTree(defaultEnv, parseTree)
}

function evalTree (env, parseTree) {
  if (!parseTree) return null
  for (let i = 1; i < parseTree.length; ++i) {
    if (parseTree[i] in env) {
      parseTree[i] = env[parseTree[i]]
    } else if (parseTree[i] instanceof Array) {
      parseTree[i] = evalTree(env, parseTree[i])
    }
  }
  return defaultEnv[parseTree[0]](parseTree.slice(1))
}

// test a file
const fs = require('fs')
const filename = process.argv[2]
fs.readFile(filename, 'utf-8', function (err, s) {
  if (err) throw err
  let result = evalLisp(s)
  console.log(result[0])
})
