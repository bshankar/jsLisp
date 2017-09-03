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
const valueParser = (s) => {
  return numberParser(s) || stringParser(s) || symbolParser(s) || lispParser(s)
}

function lispParser (s) {
  const parseTree = []
  let result = regexParser('\\(', null, s)
  if (!result) return null
  while (1) {
    let rest = result[1]
    result = valueParser(rest)
    if (!result) return [parseTree, regexParser('\\)', null, rest)[1]]
    parseTree.push(result[0])
    let decidingResult = regexParser('\\)', null, result[1])
    if (decidingResult) return [parseTree, decidingResult[1]]
  }
}

module.exports = {lispParser: lispParser}
