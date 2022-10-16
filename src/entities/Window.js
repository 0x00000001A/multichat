const {ipcMain, Menu, BrowserWindow} = require('electron')
const path = require('path')
const Logger = require('../Logger')

class WindowEntity {
  /**
   * Application instance
   * @type {Application}
   */
  app

  /**
   * Electron BrowserWindowConfig
   * @type {BrowserWindowConstructorOptions}
   */
  config

  /**
   * BrowserWindow instance. Fullfiles, when window is open
   * @type {Electron.CrossProcessExports.BrowserWindow}
   */
  instance

  /**
   * Template filename, excluding extension
   * @type {string}
   */
  #template

  /**
   * Window working directory path
   * @type {string}
   */
  #folderPath

  /**
   * Indicates, if window is external (renders external page by url instead of rendering local file)
   * @type {boolean}
   */
  #isExternal

  /**
   * @param {Application} app - Application instance
   * @param {TypeWindowConfig} config - Window configuration
   * @param {BrowserWindowConstructorOptions|{}} [overrides={}] - Additional Electron.BrowserWindow options
   */
  constructor(app, config, overrides = {}) {
    this.app = app
    this.config = {
      width: config.width,
      height: config.height,
      autoHideMenuBar: true,
      ...overrides
    }

    this.#template = config.template || 'index'
    this.#isExternal = this.#template.startsWith('http')

    if (!this.#isExternal) {
      this.#folderPath = path.join(__dirname, '..', 'windows', config.folder)
    }
  }

  addHandler(channel, handler) {
    ipcMain.handle(channel, handler)
  }

  /**
   * Open a window
   * @param url
   * @returns {Electron.CrossProcessExports.BrowserWindow}
   */
  open(url) {
    this.instance = new BrowserWindow({
      ...this.config,
      webPreferences: {
        ...this.config.webPreferences,
        preload: !this.#isExternal && path.join(this.#folderPath, `preload.js`)
      }
    })

    Menu.setApplicationMenu(Menu.buildFromTemplate([]))

    this.onBeforeOpen()

    try {
      if (url || this.#isExternal) {
        this.instance
          .loadURL(url || this.#template)
          .then(this.onOpen.bind(this))
      } else {
        this.instance
          .loadFile(path.join(this.#folderPath, `${this.#template}.html`))
          .then(this.onOpen.bind(this))
      }
    } catch (error) {
      Logger.error(error)
    }

    return this.instance
  }

  /**
   * Close window, if it was opened
   */
  close() {
    if (this.instance) {
      this.instance.close()
      this.instance = null
    }
  }

  onOpen() {
  }

  onBeforeOpen() {
  }
}

module.exports = WindowEntity
