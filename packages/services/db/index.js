const path = require('path')
const fs = require('fs')

let _db

const dbPath = path.resolve(__dirname, './db.json')
const wrap = x => x ? Object.assign({}, x) : null

const Db = {
  get() {
    if (!_db) {
      if (fs.existsSync(dbPath)) {
        // eslint-disable-next-line global-require
        _db = require('./db.json')
      } else {
        _db = { pomoList: [], pomoMap: {}, taskList: [], taskMap: {} }
        Db.saveSync()
      }
    }
    return Object.assign({}, _db)
  },
  set(setter) {
    if (typeof setter !== 'function') {
      throw new Error('Db: setter must be a function')
    }
    _db = setter(Db.get())
  },
  save() {
    fs.writeFile(dbPath, JSON.stringify(Db.get(), null, 2), err => {
      if (err) {
        console.log('save db error', err)
      }
    })
  },
  saveSync() {
    try {
      fs.writeFileSync(dbPath, JSON.stringify(Db.get(), null, 2))
    } catch (err) {
      console.log('save db error', err)
    }
  }
}

function findTaskByTaskName(taskName) {
  const db = Db.get()
  const taskId = db.taskList.find(x => !!db.taskMap[x] && db.taskMap[x].taskName === taskName)
  return findTask(taskId)
}

function findTask(taskId) {
  const db = Db.get()
  return wrap(db.taskMap[taskId])
}

function addTask({ taskName, pomoList = [] }) {
  const id = `t-${Date.now()}`
  Db.set(x => {
    x.taskList.push(id)
    x.taskMap[id] = {
      id,
      taskName,
      pomoList,
    }
    return x
  })
  return id
}

function updateTask(id, setter) {
  Db.set(x => {
    x.taskMap[id] = setter(x.taskMap[id])
    return x
  })
}

// ---- latest ---

function getLatest() {
  const db = Db.get()
  const latest = wrap(db.latest)

  if (!latest) {
    return null
  }

  const { taskId, time } = latest
  const task = findTask(taskId)

  if (!task) {
    return null
  }

  return {
    ...task,
    time,
  }
}

function setLatest({ taskId, time }) {
  Db.set(x => {
    x.latest = {
      taskId,
      time,
    }
    return x
  })
}

// --- pomo ---

function addPomo({ taskName, time }) {
  const id = `p-${Date.now()}`
  let taskId = ''

  // 关联 task
  const task = findTaskByTaskName(taskName)
  if (task) {
    taskId = task.id
    updateTask(task.id, x => {
      x.pomoList.push(id)
      return x
    })
  } else {
    taskId = addTask({
      taskName,
      pomoList: [id],
    })
  }

  Db.set(x => {
    x.pomoList.push(id)
    x.pomoMap[id] = { id, taskId, time, createdTime: Date.now() }
    return x
  })

  setLatest({ taskId, time })

  return id
}

function findPomo(id) {
  const db = Db.get()
  return wrap(db.pomoMap[id])
}

function getTaskPomo(id) {
  const pomo = findPomo(id)

  if (pomo) {
    const task = findTask(pomo.taskId)
    return {
      ...pomo,
      taskName: task.taskName,
      pomoCount: task.pomoList.length,
    }
  }
  return null
}

module.exports = {
  Db,
  addPomo,
  getTaskPomo,
  setLatest,
  getLatest,
}
