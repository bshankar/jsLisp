const lispParser = require('./parse').lispParser

const defaultEnv = {
  // keywords
  'begin': (args) => args[args.length - 1],
  'define': function (args) { defaultEnv[args[0]] = args[1] },
  'if': (args) => args[0] ? args[1] : args[2],

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
const util = require('util')
const filename = process.argv[2]
fs.readFile(filename, 'utf-8', function (err, s) {
  if (err) throw err
  let result = evalLisp(s)
  console.log(result)
})
