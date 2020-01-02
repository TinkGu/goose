const { exec } = require('child_process')

function notification({ title, message }) {
  exec(`osascript -e 'display notification "${message}" with title "${title}"'`)
}

module.exports = notification
