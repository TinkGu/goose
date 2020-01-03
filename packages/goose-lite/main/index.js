const path = require('path')
const platform = require('os').platform()
const menubar = require('menubar')
const { shell } = require('electron')

const WIDTH = 400
const HEIGHT = 600
const assetPath = path.join(__dirname, '../../../assets')

const mb = menubar({
  icon: path.join(assetPath, `${platform}-IconTemplate.png`),
  preloadWindow: true,
  width: WIDTH,
  height: HEIGHT,
  backgroundColor: 'white',
  // alwaysOnTop: true
})

mb.on('ready', () => {
  mb.window.setSkipTaskbar(true)

  // Workaround to fix window position when statusbar at top for win32
  if (platform === 'win32') {
    if (mb.tray.getBounds().y < 5) {
      mb.setOption('windowPosition', 'trayCenter')
    }
  }

  mb.window.webContents.on('will-navigate', (event, url) => {
    event.preventDefault()
    shell.openExternal(url)
  })
})
