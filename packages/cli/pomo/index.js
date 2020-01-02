const { create, continues, notify } = require('./api')

function help() {
  // eslint-disable-next-line no-console
  console.log(`
      Usage:
        pomo taskName [time]
          the default time will be "25" minutes
        pomo -n pomoId
        pomo [options]
      Options:
        -h: [help] show this page
        -c: [continue] create a new pomo with the latest task
        -l: [list] list all the pomoes of today
        -k: [kill] stop all the running pomoes
        -n: [notify] show notifications for the comming pomo
    `)
}

const main = () => {
  const option = process.argv[2]

  if (option === '-h') {
    return help()
  }

  if (option === '-a') {
    return continues()
  }

  if (option === '-n') {
    const pomoId = process.argv[3]
    notify({ pomoId })
  }

  if (!option) {
    return help()
  }

  const taskName = option
  const time = process.argv[3]
  create({ taskName, time })
}

main()
