const path = require('path')
const { exec } = require('child_process')
const { addPomo, Db, getLatest, getTaskPomo } = require('services/db')
const notification = require('services/notification')
const ilog = require('services/log')
// eslint-disable-next-line no-console
const clog = console.log

function create(options = {}) {
  const { taskName = '', time: t = 25 } = options || {}
  const time = parseInt(t, 10)
  if (time < 1) {
    throw new Error('pomo: time must be greater than or equal to 1')
  }
  const pwd = path.join(__dirname, 'index.js')
  const id = addPomo({ taskName, time })
  const cmd = `echo "node ${pwd} -n ${id}" | at now + ${time} ${time > 1 ? 'minutes' : 'minute'}`
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      clog(err)
      return
    }

    Db.save()
    clog(stderr)
  })
}

function continues(options = {}) {
  const latest = getLatest()
  if (latest) {
    const { taskName, time: recordTime } = latest
    const { time: userTime } = options || {}
    const time = userTime || recordTime
    create({ taskName, time })
    clog(`taskName = ${taskName}, time = ${time}`)
    notification({ title: 'pomo', message: `继续执行「${taskName}」` })
  } else {
    clog(`
      no latest record...
      use the following cmd to create a new pomo
        pomo <taskName> <time>
    `)
  }
}

function notify({ pomoId }) {
  const taskPomo = getTaskPomo(pomoId)

  if (!taskPomo) {
    notification({ title: 'pomo', message: '出错了，可以看看日志' })
    ilog(pomoId)
    return
  }

  notification({
    title: taskPomo.taskName,
    message: `今天已经执行 ${taskPomo.pomoCount} 次了，按热键继续`,
  })
}

module.exports = {
  create,
  continues,
  notify,
}
