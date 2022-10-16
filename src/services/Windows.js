const {BrowserWindow} = require('electron')

class WindowsService {
  constructor(app) {
    this.app = app
  }

  /**
   * Window collection
   * @type {Object.<String, WindowEntity>}
   */
  #windows = {}

  /**
   * @param {string} name
   * @param {typeof WindowEntity} entity
   */
  add(name, entity) {
    this.#windows[name] = new entity(this.app)
  }

  /**
   * @param {string} windowName
   * @param {string} [url]
   * @returns {Electron.CrossProcessExports.BrowserWindow}
   */
  open(windowName, url) {
    return this.#windows[windowName].open(url)
  }

  /**
   * Close window by its name
   * @param windowName {string} - window name
   */
  close(windowName) {
    this.#windows[windowName].close()
  }

  /**
   * Get list of ALL electron open windows
   * @returns {Electron.BrowserWindow[]}
   */
  getAllBrowserWindows() {
    return BrowserWindow.getAllWindows()
  }

  /**
   * Check, if there is any open window
   * @returns {boolean}
   */
  hasOpenWindows() {
    return this.getAllBrowserWindows().length > 0
  }
}

module.exports = WindowsService
