const Google = require('googleapis').google
const Logger = require('../Logger')
const ChatEntity = require('../entities/Chat')

class YouTubeProvider extends ChatEntity {
  constructor(chatService) {
    super('YouTube')

    this.config = chatService.config.get(this.name)
    this.OAuth2 = Google.auth.OAuth2
    this.YouTube = Google.youtube('v3')
    this.liveChatId = undefined
    this.chatService = chatService
    this.chatNextPage = undefined
    this.secureStoreService = chatService.secureStoreService
    this.chatTrackingRefreshTime = 5000

    this.auth = new this.OAuth2(
      this.config.get('clientId'),
      this.config.get('secretKey'),
      this.config.get('redirectUrl')
    )

    this.auth.on('tokens', this.refreshAuthentication.bind(this))
  }

  async login(request) {
    const url = new URL(request.url)
    const authenticationCode = url.searchParams.get('code')
    const error = url.searchParams.get('error')

    if (error) {
      return Promise.reject(false)
    }

    const credentials = await this.auth.getToken(authenticationCode)
    const tokens = credentials.tokens

    this.auth.setCredentials(tokens)
    this.secureStoreService.set(this.name, tokens)
  }

  async sendMessage(message) {
    try {
      // noinspection JSCheckFunctionSignatures
      await this.YouTube.liveChatMessages.insert({
        auth: this.auth,
        part: 'snippet',
        resource: {
          snippet: {
            type: 'textMessageEvent',
            liveChatId: this.liveChatId,
            textMessageDetails: {
              messageText: message.content
            }
          }
        }
      }, () => {
      })

      return true
    } catch (e) {
      Logger.error(e)
      return false
    }
  }

  getAuthenticationUrl() {
    return this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: this.config.get('scopes'),
      include_granted_scopes: true
    })
  }

  refreshAuthentication(tokens) {
    if (tokens.refresh_token) {
      this.secureStoreService.set(this.name, tokens)
      this.auth.setCredentials(tokens)
    }
  }

  isAuthenticated(args) {
    const tokens = this.secureStoreService.get(this.name)
    this.auth.setCredentials(tokens)

    this.findActiveChat()

    return Promise.resolve(!!tokens)
  }

  async findActiveChat() {
    const response = await this.YouTube.liveBroadcasts.list({
      auth: this.auth,
      part: 'snippet',
      mine: 'true'
    })

    const latestChat = response.data.items.find((chat) => {
      return !chat.snippet.actualEndTime
    })

    if (latestChat && latestChat.snippet.liveChatId) {
      this.liveChatId = latestChat.snippet.liveChatId
      this.startChatTracking()
    } else {
      this.liveChatId = null
    }
  }

  startChatTracking() {
    setInterval(
      this.getChatMessages.bind(this),
      this.chatTrackingRefreshTime
    )
  }

  async getChatMessages() {
    const response = await this.YouTube.liveChatMessages.list({
      auth: this.auth,
      part: 'snippet,authorDetails',
      liveChatId: this.liveChatId,
      pageToken: this.chatNextPage
    })

    const chat = response.data
    const newMessages = chat.items
    const previousPage = this.chatNextPage

    this.chatNextPage = chat.nextPageToken

    // if (!previousPage) {
    //   return Promise.resolve([])
    // }

    newMessages.forEach((message) => {
      const isMyMessage = message.authorDetails.isChatOwner
      const messageText = message.snippet.textMessageDetails.messageText
      const messageAuthor = message.authorDetails.displayName

      if (isMyMessage) {
        return
      }

      this.chatService.shareMessage({
        author: messageAuthor,
        content: messageText,
        provider: this.name
      })
    })
  }
}

module.exports = YouTubeProvider
