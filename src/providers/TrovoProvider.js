const crypto = require('crypto')
const axios = require('axios')
const Logger = require('../Logger')
const WSClient = require('websocket').w3cwebsocket
const ChatEntity = require('../entities/Chat')

class TrovoProvider extends ChatEntity {
  config
  #exchangeTokenUrl = 'https://open-api.trovo.live/openplatform/exchangetoken'
  #authenticationUrl = 'https://open.trovo.live/page/login.html?response_type=code'

  constructor(chatService) {
    super('Trovo')

    this.config = chatService.config.get(this.name)
    this.chatService = chatService
    this.secureStoreService = chatService.secureStoreService
    this.authenticationData = {}
  }

  async login(request) {
    const url = new URL(request.url)
    const authenticationCode = url.searchParams.get('code')

    const tokenResponse = await this.exchangeAuthenticationCodeToToken(authenticationCode)
    await this.storeAuthenticationData(tokenResponse.data)
    return this.secureStoreService.get(this.name)
  }

  async exchangeAuthenticationCodeToToken(code) {
    return await axios.post(this.#exchangeTokenUrl, {
      code,
      grant_type: 'authorization_code',
      client_secret: this.config.get('secretKey'),
      redirect_uri: this.config.get('redirectUrl')
    }, {
      headers: {
        'Accept': 'application/json',
        'Client-ID': this.config.get('clientId'),
        'Content-Type': 'application/json'
      }
    })
  }

  async storeAuthenticationData(data) {
    try {
      const token = data['access_token']
      const userInfoResponse = await this.getUserData(token, this.config.get('clientId'))
      const chatTokenResponse = await this.getChatToken(token, this.config.get('clientId'))

      const user = userInfoResponse.data
      const chat = chatTokenResponse.data

      this.secureStoreService.set(this.name, {
        info: user.info,
        email: user.email,
        userId: user.userId,
        userName: user.userName,
        nickName: user.nickName,
        channelId: user.channelId,
        profilePic: user.profilePic,
        expiresIn: data['expires_in'],
        tokenType: data['token_type'],
        chatToken: chat.token,
        accessToken: token,
        refreshToken: data['refresh_token']
      })

      this.authenticationData = this.secureStoreService.get(this.name)

      Logger.success('user data received')
    } catch (error) {
      Logger.error(error)
    }
  }

  getUserData(token, clientId) {
    return axios.get('https://open-api.trovo.live/openplatform/getuserinfo', {
      headers: {
        'Accept': 'application/json',
        'Client-ID': clientId,
        'Authorization': `OAuth ${token}`
      }
    })
  }

  getChatToken(token, clientId) {
    return axios.get('https://open-api.trovo.live/openplatform/chat/token', {
      headers: {
        'Accept': 'application/json',
        'Client-ID': clientId,
        'Authorization': `OAuth ${token}`
      }
    })
  }

  getAuthenticationUrl() {
    const url = new URL(this.#authenticationUrl)

    url.searchParams.set('scope', this.config.get('scopes').join('+'))
    url.searchParams.set('state', this.generateSecureToken())
    url.searchParams.set('client_id', this.config.get('clientId'))
    url.searchParams.set('redirect_uri', this.config.get('redirectUrl'))

    return url.toString()
  }

  async sendMessage(message) {
    try {
      await axios.post('https://open-api.trovo.live/openplatform/chat/send', {
        content: message.content,
        channel_id: this.authenticationData.channelId
      }, {
        headers: {
          'Accept': 'application/json',
          'Client-ID': this.config.get('clientId'),
          'Authorization': `OAuth ${this.authenticationData.accessToken}`
        }
      })

      return true
    } catch (error) {
      Logger.error(error.response.data)
      return false
    }
  }

  handleError(error) {
    const errorStatusCode = error?.response?.data?.status

    if (!errorStatusCode) {
      Logger.object('Unrecognized error type', error)
      return
    }

    // Access token is expired
    if (errorStatusCode === 11714) {

    }
  }

  generateSecureToken() {
    this.secureToken = crypto.randomBytes(64).toString('hex')

    return this.secureToken
  }

  async isAuthenticated(args) {
    this.authenticationData = this.secureStoreService.get(this.name)

    try {
      await axios.get('https://open-api.trovo.live/openplatform/validate', {
        headers: {
          'Accept': 'application/json',
          'Client-ID': this.config.get('clientId'),
          'Authorization': `OAuth ${this.authenticationData.accessToken}`
        }
      })
    } catch (error) {
      return false
    }

    const chatTokenResponse = await this.getChatToken(
      this.authenticationData.accessToken,
      this.config.get('clientId')
    )

    this.secureStoreService.set(this.name, {
      ...this.secureStoreService.get(this.name),
      chatToken: chatTokenResponse.data.token
    })

    this.authenticationData = this.secureStoreService.get(this.name)

    // noinspection JSCheckFunctionSignatures
    this.wsClient = new WSClient('wss://open-chat.trovo.live/chat')

    this.wsClient.onopen = () => {
      this.wsClient.send(JSON.stringify({
        type: 'AUTH',
        nonce: Math.floor(Date.now() / 1000).toString(),
        data: {
          token: chatTokenResponse.data.token
        }
      }))

      setInterval(() => {
        this.wsClient.send(JSON.stringify({
          type: 'PING',
          nonce: Math.floor(Date.now() / 1000).toString()
        }))
      }, 30000)

      const myId = Number(this.authenticationData.userId)

      this.wsClient.onmessage = (event) => {
        /** @type {TypeTrovoWebSocketResponse} */
        const response = JSON.parse(event.data)

        if (response.type === 'CHAT' && response.data.chats) {
          if (!this.initialLoaded) {
            this.initialLoaded = true
          } else {
            response.data.chats.forEach((message) => {
              const isMyMessage = myId === message.sender_id

              if (isMyMessage) {
                return
              }

              Logger.object('Trovo message', response)

              this.chatService.shareMessage({
                author: message.nick_name,
                content: message.content,
                provider: this.name
              })
            })
          }
        }
      }
    }

    return Promise.resolve(true)
  }

  async refreshAuthentication() {
    if (!this.authenticationData.refreshToken) {
      return false
    }

    try {
      const refreshTokenResult = await axios.post('https://open-api.trovo.live/openplatform/refreshtoken', {
        'refresh_token': this.authenticationData.refreshToken,
        'client_secret': this.config.get('secretKey'),
        'grant_type': 'refresh_token'
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'client-id': this.config.get('clientId')
        }
      })

      await this.storeAuthenticationData(refreshTokenResult.data)

      Logger.info('Refreshing token result', refreshTokenResult)

      return false
    } catch (error) {
      Logger.error(error)
      return false
    }
  }
}

/**
 * @typedef TypeTrovoWebSocketResponse
 * @property {TypeTrovoWebSocketData} data
 * @property {TypeTrovoWebSocketMessageType} type
 */

/**
 * @typedef TypeTrovoWebSocketData
 * @property {TypeTrovoChatMessage[]} chats
 */

/**
 * @typedef TypeTrovoChatMessage
 * @property {string} content
 * @property {string} nick_name
 * @property {number} sender_id
 */

/**
 * @typedef {'CHAT'} TypeTrovoWebSocketMessageType
 */

module.exports = TrovoProvider
