const Logger = require('../Logger')

/**
 * @typedef TypeWebSocketConnection
 * @extends EventEmitter
 */

/**
 * @typedef {'utf8'|'binary'} TypeWebSocketConnectionMessageTypes
 */

/**
 * @typedef TypeWebSocketConnectionMessage
 * @property {TypeWebSocketConnectionMessageTypes} type - Connection message type
 * @property {String|Buffer} utf8Data - Connection message data
 */

class WebSocketConnection {
  /** @type {WebSocketService} */
  #wsService

  /** @type {TypeWebSocketConnection} */
  #connection

  /**
   * @param {TypeWebSocketConnection} connection
   * @param {WebSocketService} wsService
   */
  constructor(connection, wsService) {
    this.#wsService = wsService
    this.#connection = connection

    connection.on('close', this.handleConnectionClose.bind(this))
    connection.on('message', this.handleConnectionMessage.bind(this))
  }

  /**
   * Fires, if connection is closed
   * @param {string} code
   * @param {string} reason
   */
  handleConnectionClose(code, reason) {
    Logger.info('peer disconnected', code, reason, this.#connection.remoteAddress)
  }

  /**
   * Fires, if message is received from the connection
   * @param {TypeWebSocketConnectionMessage} message
   */
  handleConnectionMessage(message) {
    if (message.type === 'utf8') {
      this.#wsService.handleWSServerPeerMessage(this, JSON.parse(message.utf8Data))
    }
  }

  /**
   * @param {TypeWebSocketMessage} message
   */
  sendMessage(message) {
    this.#connection.sendUTF(message)
  }
}

module.exports = WebSocketConnection
