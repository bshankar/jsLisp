const fs = require('fs')
const { sexpParser } = require('./lisp')
const { env } = require('./env')

fs.readFile(process.argv[2], 'utf8', (err, s) => {
  if (err) throw err
  console.log(sexpParser(s, env))
})
