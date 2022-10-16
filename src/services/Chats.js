const Logger = require('../Logger')
const SessionsService = require('./Sessions')
const WebSocketService = require('./WebSocket')

class ChatsService {
  /**
   * List of chat providers
   * @type {Object.<String, ChatEntity>}
   */
  #providers = {}

  constructor(app) {
    this.config = app.config
    this.windows = app.windows
    this.wsService = new WebSocketService()
    this.wsService.startServer()
    this.secureStoreService = new SessionsService()
  }

  login(providerName) {
    const provider = this.getProvider(providerName)

    return new Promise((resolve, reject) => {
      const authenticationUrl = provider.getAuthenticationUrl()
      const windowInstance = this.windows.open('Login', authenticationUrl)
      const windowRequest = windowInstance.webContents.session.webRequest
      const requestFilter = {
        urls: [`${provider.config.get('redirectUrl')}*`]
      }

      windowRequest.onBeforeRequest(requestFilter, (request) => {
        windowInstance.close()

        provider
          .login(request)
          .then(() => {
            resolve(true)
          })
          .catch(() => {
            reject(false)
          })
      })
    })
  }

  logout(providerName) {
    return this.#providers[providerName].logout()
  }

  isAuthenticated(providerName) {
    return this.#providers[providerName].isAuthenticated()
  }

  refreshAuthentication(providerName) {
    return this.#providers[providerName].refreshAuthentication()
  }

  /**
   * @param {TypeChatMessageOutgoing} message
   * @returns {Promise<Awaited<{name: *, status: *}>[] | *[]>}
   */
  sendMessage(message) {
    const providers = Object.values(this.#providers)

    return (
      Promise
        .all(
          providers.map(async (provider) => {
            const status = await provider.sendMessage(message)

            return {name: provider.name, status}
          })
        )
        .catch((error) => {
          Logger.error(error)
          return []
        })
    )
  }

  removeMessage(...messageData) {
    // this.getProviders().forEach((provider) => {
    //   provider.removeMessage(...messageData)
    // })
  }

  /**
   * Add provider instance
   * @param instance
   */
  addProvider(instance) {
    if (this.#providers[instance.name]) {
      throw new Error(`Service provider with name ${instance.name} already exists`)
    }

    this.#providers[instance.name] = instance
  }

  /**
   * Returns provider instance by its name
   * @param name
   * @returns {ChatEntity}
   */
  getProvider(name) {
    return this.#providers[name.toLowerCase()]
  }

  async checkAuthentication(provider) {
    try {
      let isAuthenticated = await this.isAuthenticated(provider.name)

      Logger.info('Authentication status for', provider.name, isAuthenticated)

      if (!isAuthenticated) {
        isAuthenticated = await this.refreshAuthentication(provider.name)
        Logger.info('Refreshing token for', provider.name, isAuthenticated)
      }

      return {
        name: provider.label,
        isAuthenticated
      }
    } catch (error) {
      return {
        name: provider.label,
        isAuthenticated: false
      }
    }
  }

  /**
   * Returns an array of providers instances
   */
  getProviders() {
    return (
      Promise
        .all(
          Object
            .values(this.#providers)
            .map(this.checkAuthentication.bind(this))
        )
        .catch(Logger.error)
    )
  }

  /**
   * Send message to other than current chat providers.
   * Send message to the local websocket server.
   * Should be called manually from each chat provider if new message was received.
   * @param {TypeChatMessageIncoming} message
   */
  shareMessage(message) {
    Object.values(this.#providers).forEach((provider) => {
      if (provider.name !== message.provider) {
        provider
          .sendMessage({
            author: message.author,
            content: this.prefixedMessageText(provider, message)
          })
          .catch(Logger.error)

        this.wsService.sendMessage(message)
      }
    })
  }

  terminate() {
    this.wsService.stopServer()
  }

  prefixedMessageText(provider, message) {
    return `[${provider.label}] ${message.author}: ${message.content}`
  }
}

module.exports = ChatsService
