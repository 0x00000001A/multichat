const Logger = require('../Logger')

class ChatEntity {
  /**
   * Service name.
   * Should be unique.
   * Used in service managers.
   * @type {string}
   */
  name
  label
  config

  constructor(name) {
    this.name = name.toLowerCase()
    this.label = name
  }

  /**
   * @param args
   * @returns {Promise<*>}
   */
  login(...args) {
    Logger.error('not overrided')
    return Promise.reject()
  }

  logout() {
    Logger.error('not overrided')
  }

  /**
   * @param {Array} args - Possible arguments
   * @returns {Promise<boolean>} - True - if user it authenticated, false otherwise
   */
  isAuthenticated(...args) {
    Logger.error('not overrided')
    return Promise.reject(false)
  }

  getAuthenticationUrl() {
    Logger.error('is not overrided')
    return ''
  }

  refreshAuthentication() {
    Logger.error('not overrided')
  }

  /**
   * Send chat message
   *
   * @param {TypeChatMessageOutgoing} message - chat message
   * @returns {Promise<Boolean>}
   */
  sendMessage(message) {
    Logger.error('not overrided')
    return Promise.reject(false)
  }

  /**
   * Remove specified chat message
   * @returns {Promise<Boolean>}
   */
  removeMessage() {
    Logger.error('not overrided')
    return Promise.reject(false)
  }
}


module.exports = ChatEntity
