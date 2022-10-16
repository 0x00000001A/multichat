const electron = require('electron').app

const ChatService = require('./services/Chats')
const ConfigService = require('./services/Config')
const WindowsService = require('./services/Windows')

const TrovoProvider = require('./providers/TrovoProvider')
const YouTubeProvider = require('./providers/YouTubeProvider')

const MainWindow = require('./windows/Main')
const LoginWindow = require('./windows/Login')
const Logger = require('./Logger')

class Application {
  /**
   * Application config service
   * @type {ConfigService}
   */
  config

  /**
   * Application windows service
   * @type {WindowsService}
   */
  windows

  /**
   * Electron application
   * @type {Electron.CrossProcessExports.App}
   */
  electron

  constructor() {
    this.config = new ConfigService()
    this.windows = new WindowsService(this)
    this.electron = electron

    Logger.object('Application configuration loaded', this.config.get())

    this.windows.add('Main', MainWindow)
    this.windows.add('Login', LoginWindow)

    this.chatService = new ChatService(this)
    this.chatService.addProvider(new TrovoProvider(this.chatService))
    this.chatService.addProvider(new YouTubeProvider(this.chatService))
  }

  /**
   * Runs the application
   * Should be called right after creating instance
   */
  initialize() {
    if (require('electron-squirrel-startup')) {
      this.electron.quit()
    }

    this.electron.on('ready', this.#handleApplicationReady.bind(this))
    this.electron.on('activate', this.#handleMacOsRecreateWindow.bind(this))
    this.electron.on('window-all-closed', this.#handleApplicationDestroy.bind(this))
  }

  /**
   * Fires, when main window is open
   *
   * @returns {void}
   */
  #handleApplicationReady() {
    this.windows.open('Main')
  }

  /**
   * For macOS only. Fires, when window is recreated
   *
   * @returns {void}
   */
  #handleMacOsRecreateWindow() {
    if (!this.windows.hasOpenWindows()) {
      this.#handleApplicationReady()
    }
  }

  /**
   * Fires on application close.
   * Gracefully destroys the application instance.
   *
   * @returns {void}
   */
  #handleApplicationDestroy() {
    if (process.platform !== 'darwin') {
      this.chatService.terminate()
      this.electron.quit()
    }
  }
}

module.exports = Application
