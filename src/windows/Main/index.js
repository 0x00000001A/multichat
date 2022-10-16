const WindowEntity = require('../../entities/Window')

class MainWindow extends WindowEntity {
  constructor(app) {
    super(app, {
      width: 400,
      height: 700,
      folder: 'Main'
    })

    this.addHandler('getProviders', this.getProviders.bind(this))
    this.addHandler('onMessage', this.onMessage.bind(this))
    this.addHandler('onLogin', this.onLogin.bind(this))
  }

  onLogin(event, providerName) {
    return this.app.chatService.login(providerName)
  }

  onMessage(event, content) {
    return this.app.chatService.sendMessage({content})
  }

  getProviders() {
    return this.app.chatService.getProviders()
  }

  onBeforeOpen() {
    // noinspection JSUnresolvedFunction
    this.instance.openDevTools()
  }
}

module.exports = MainWindow
