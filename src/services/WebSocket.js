const http = require('http')
const Logger = require('../Logger')
const WSServer = require('websocket/lib/WebSocketServer')
const WSPeerConnection = require('../entities/WebSocketConnection')

/**
 * @typedef TypeWebSocketServer
 * @extends EventEmitter
 * @extends WSServer
 */

class WebSocketService {
  #port = 3933
  #clients = []
  #protocol = 'echo-protocol'

  startServer() {
    this.httpServer = http.createServer(this.handleHttpServerRequest)
    this.httpServer.on('error', this.handleHttpServerError)
    this.httpServer.listen(this.#port, this.handleHttpServerStart.bind(this))
  }

  handleHttpServerError(error) {
    Logger.error(error.code, error.message)
  }

  stopServer() {
    if (this.wsServer) {
      this.wsServer.closeAllConnections()
      this.wsServer.shutDown()
    }

    this.httpServer.close()
  }

  /**
   * @param {TypeChatMessageOutgoing} message - Chat message
   */
  sendMessage(message) {
    Logger.info(message)

    this.#clients.forEach((client) => {
      client.sendMessage({
        type: 'MESSAGE',
        message
      })
    })
  }

  handleHttpServerStart() {
    Logger.success('http server started')

    /** @type {TypeWebSocketServer} */
    this.wsServer = new WSServer({
      httpServer: this.httpServer,
      autoAcceptConnections: false
    })

    this.wsServer.on('request', this.handleWSServerPeer.bind(this))
  }

  /**
   * @param {TypeWebSocketConnection} request
   */
  handleWSServerPeer(request) {
    Logger.info('ws server received peer request with origin', request.origin)
    this.#clients.push(new WSPeerConnection(request.accept(this.#protocol, request.origin), this))
  }

  /**
   * @param {WebSocketConnection} connection
   * @param {*} message
   */
  handleWSServerPeerMessage(connection, message) {
    switch (message.type) {
      case 'PING':
        this.sendMessage({type: 'PING', message})
        break
      default:
        Logger.warning('unsupported peer message type', message.type)
    }
  }

  handleHttpServerRequest(request, response) {
    Logger.warning('http server received request from', request.url)

    response.writeHead(404)
    response.end()
  }
}

module.exports = WebSocketService
