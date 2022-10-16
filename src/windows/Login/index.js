const WindowEntity = require('../../entities/Window')

class LoginWindow extends WindowEntity {
  constructor(app) {
    super(app, {
      width: 450,
      height: 600,
      folder: 'Login'
    })
  }
}

module.exports = LoginWindow
