const path = require('path')
const fs = require('fs')

const logPath = path.join(__dirname, 'logs')

function ilog(data) {
  const str = JSON.stringify(data, null, 2)
  const filename = `${Date.now()}.txt`
  fs.exists(logPath, (res) => {
    if (!res) {
      fs.mkdirSync(logPath)
    }
    fs.writeFile(path.join(logPath, filename), str, (err) => {
      if (err) {
        console.error(err)
      }
    })
  })
}

module.exports = ilog
