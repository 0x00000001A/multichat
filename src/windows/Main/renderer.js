const elChat = document.querySelector('.app__chat')
const elChatForm = document.querySelector('.app__form')
const elChatInput = elChatForm.querySelector('.app__chat-input')
const elChatAnchor = elChat.querySelector('#anchor')
const elProvidersContainer = document.querySelector('.providers')

async function onLogin(providerName) {
  const elStatus = document.querySelector(`[data-provider="${providerName}"]`)
  const elIndicator = elStatus.querySelector('.status__indicator')

  try {
    await window.bridge.onLogin(providerName)
    elIndicator.classList.remove('status__indicator_error')
    elIndicator.classList.add('status__indicator_success')
    elStatus.dataset.authenticated = 'true'
  } catch (error) {
    elIndicator.classList.remove('status__indicator_suceess')
    elIndicator.classList.add('status__indicator_error')
    elStatus.dataset.authenticated = 'false'
  }
}

async function loadProviders() {
  const response = await window.bridge.getProviders()
  const fragment = document.createDocumentFragment()

  response.forEach((provider) => {
    const elStatus = document.createElement('div')
    const elProviderName = document.createElement('div')
    const elStatusIndicator = document.createElement('div')

    elStatus.classList.add('status')
    elProviderName.classList.add('status__text')
    elStatusIndicator.classList.add('status__indicator')
    elStatusIndicator.classList.toggle('status__indicator_success', !!provider.isAuthenticated)
    elStatusIndicator.classList.toggle('status__indicator_error', !provider.isAuthenticated)

    elProviderName.innerText = provider.name
    elStatus.dataset.provider = provider.name
    elStatus.dataset.authenticated = provider.isAuthenticated

    elStatus.addEventListener('click', () => {
      if (!provider.isAuthenticated) {
        onLogin(provider.name)
      }
    })

    elStatus.append(elStatusIndicator, elProviderName)
    fragment.append(elStatus)
  })

  elProvidersContainer.append(fragment)
}

function renderChatMessage(provider, author, text) {
  const chatHasScrollbar = hasScrollbar(elChat)

  const elMessageContainer = document.createDocumentFragment()
  const elMessage = document.createElement('chat-message')
  const isMy = !author && !text

  if (!isMy) {
    elMessage.author = author
    elMessage.message = text
    elMessage.provider = provider
  } else {
    elMessage.my = isMy
    elMessage.message = provider
  }

  elMessageContainer.append(elMessage)
  elChat.insertBefore(elMessageContainer, elChatAnchor)
  const chatHaveScrollbar = hasScrollbar(elChat)

  if (!chatHasScrollbar && chatHaveScrollbar) {
    elChatAnchor.scrollIntoView({
      block: 'end',
      inline: 'nearest',
      behavior: 'smooth'
    })
  }
}

function connectToWSService() {
  const chatConnection = new WebSocket('ws://localhost:3933', 'echo-protocol')

  setInterval(() => {
    chatConnection.send(JSON.stringify({
      type: 'PING',
      message: Math.floor(Date.now() / 1000).toString()
    }))
  }, 30000)

  chatConnection.onmessage = (event) => {
    const response = JSON.parse(event.data)
    const message = response.message

    if (response.type === 'MSG') {
      renderChatMessage(message.provider, message.author, message.content)
    }
  }
}

function initChatForm() {
  elChatForm.addEventListener('submit', (event) => {
    event.preventDefault()

    const messageText = elChatInput.value.trim()

    if (messageText.length) {
      window.bridge.onMessage(messageText).then((...args) => {
        renderChatMessage(messageText)
      }).catch((...args) => {
        console.log('MESSAGE_REJECTED', ...args)
      })
    }

    elChatInput.value = ''
  })
}

function hasScrollbar(el) {
  return el.scrollHeight > el.clientHeight
}

loadProviders().then(() => {
  connectToWSService()
  initChatForm()
})
