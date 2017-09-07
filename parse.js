function regexParser (pattern, evalFn, s) {
  const regex = new RegExp('^\\s*' + pattern)
  let matched = s.match(regex)
  if (!matched) return null
  return afterRegexMatch(s, matched, evalFn)
}

function afterRegexMatch (s, matched, evalFn) {
  const len = matched[0].length
  matched[0] = matched[0].trim()
  if (matched.index === 0) {
    const result = (evalFn !== null) ? evalFn(matched[0]) : matched[0]
    return [result, s.slice(len)]
  }
}

const numberParser = regexParser.bind(null, '[-+]?\\d+\\.?\\d*[eE]?[-+]?\\d*', parseFloat)
const stringParser = regexParser.bind(null, '"(?:\\\\"|[^"])*"', function (s) { return s.slice(1, s.length - 1) })
const symbolParser = regexParser.bind(null, '[^\\s()]+', null)
const quoteParser = regexParser.bind(null, "(?:quote|\\')", null)

function literalExpParser (s) {
  let result = quoteParser(s)
  if (!result) return null
  result = regexParser('\\(', null, result[1])
  if (!result) {
    return regexParser('[^)]+', function (s) { return "'" + s.slice(quoteParser(s)[0].length).trim() }, s)
  }
  // we found an opening parenthesis,
  // look for its matching closing parenthesis
  let opened = 1
  let i = 0
  for (; i !== result[1].length && opened; ++i) {
    if (result[1][i] === '(') ++opened
    else if (result[1][i] === ')') --opened
  }
  return ["'(" + result[1].slice(0, i), result[1].slice(i)]
}

function lambdaExpParser (s) {
  // (lambda (param1 param2 ...) (body1) (body2) ...)
  let result = regexParser('lambda', null, s)
  if (!result) return null
  let argsResult = regexParser('\\([^)]+\\)', function (s) { return s.slice(1, s.length - 1).split(' ') }, result[1])
  if (!argsResult) return null
  result = literalExpParser("'(" + argsResult[1])
  const body = lispParser(result[0].slice(1))[0]
  return [['lambda'].concat([argsResult[0]]).concat(body), ')' + result[1]]
}

function Macro (params, body) {
  this.params = params
  this.body = body
}

const macros = {}

function macroParser (s) {
  // (defmacro name (params) (body with params))
  let result = regexParser('defmacro', null, s)
  if (!result) return null
  result = symbolParser(result[1])
  const macroName = result[0]
  let argsResult = regexParser('\\([^)]+\\)', function (s) { return s.slice(1, s.length - 1).split(' ') }, result[1])
  if (!argsResult) return null
  result = literalExpParser("'(" + argsResult[1])
  const body = lispParser(result[0].slice(1))[0]
  macros[macroName] = new Macro(argsResult[0], body)
  return ['defmacro', ')' + result[1]]
}

const valueParser = (s) => {
  return numberParser(s) || stringParser(s) || macroParser(s) || lambdaExpParser(s) ||
    literalExpParser(s) || symbolParser(s) || lispSegmentParser(s)
}

function lispSegmentParser (s) {
  const parseTree = []
  let result = regexParser('\\(', null, s)
  if (!result) return null
  while (1) {
    let rest = result[1]
    result = valueParser(rest)
    if (!result) return [parseTree, regexParser('\\)', null, rest)[1]]
    if (result[0] instanceof Array && result[0][0] instanceof Array && result[0].length === 1) {
      parseTree.push(result[0][0])
    } else if (result[0] !== 'defmacro') {
      parseTree.push(result[0])
    }
    let decidingResult = regexParser('\\)', null, result[1])
    if (decidingResult) return [parseTree, decidingResult[1]]
  }
}

function updateMacroBody (params, args, body) {
  for (let i in body) {
    if (body[i] instanceof Array) body[i] = updateMacroBody(params, args, body[i])
    else if (params.indexOf(body[i]) > -1) {
      const arg = args[params.indexOf(body[i])]
      if (arg[0] instanceof Array) body = body.slice(0, i).concat(arg).concat(body.slice(i).slice(1))
      else body[i] = args[params.indexOf(body[i])]
    }
  }
  return body
}

function expandMacros (ast) {
  for (let i = 0; i < ast.length; ++i) {
    if (ast[i] instanceof Array) {
      ast[i] = expandMacros(ast[i])
    } else if (ast[i] in macros) {
      const m = macros[ast[i]]
      const args = []
      for (let j = 0; j < m.params.length - 1; ++j) {
        args.push(ast[i + j + 1])
      }
      args.push(ast.slice(m.params.length))
      m.body = updateMacroBody(m.params, args, m.body)
      ast[i] = macros[ast[i]].body
      ast = ast.slice(0, i + 1)
    }
  }
  return ast
}

function lispParser (s) {
  let res = []
  while (s.match('[^\\s]+') !== null) {
    const result = lispSegmentParser(s)
    res.push(result[0])
    s = result[1]
  }
  res = expandMacros(res)
  // flatten and get rid of empty arrays
  res = res.filter(e => e.length)
  while (res.length === 1) res = res[0]
  return [res, s]
}

module.exports = {lispParser: lispParser}
