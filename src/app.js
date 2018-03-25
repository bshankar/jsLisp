const fs = require('fs')
const { sexpParser } = require('./lisp')

fs.readFile(process.argv[2], 'utf8', (err, s) => {
  if (err) throw err
  console.log(sexpParser(s))
})
