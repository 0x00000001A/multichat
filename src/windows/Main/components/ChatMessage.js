const template = document.createElement('template')
template.innerHTML = `
  <style>
    .message {
      margin: 16px;
      position: relative;
      scroll-snap-align: start;
      scroll-snap-stop: normal;
    }

    .message .message__corner {
      width: 16px;
      height: 16px;
      color: #eaeaea;
      flex-shrink: 0;
      margin-right: -4px;
    }

    .message .message__body {
      display: flex;
      align-items: center;
      flex-wrap: nowrap;
    }

    .message.message_my .message__body {
      flex-direction: row-reverse;
    }

    .message.message_my .button__icon {
      color: #000;
    }

    .message.message_my .message__corner {
      color: #b9cae3;
    }

    .message.message_my .button,
    .message.message_my .message__text {
      background: #b9cae3;
      border-color: #b9cae3;
    }

    .message.message_my .message__corner {
      transform: rotate(180deg);
      margin-right: 0;
      margin-left: -4px;
    }

    .message.message_my .message__header {
      display: none;
    }

    .message .message__text {
      padding: 8px;
      border-radius: 8px;
      background: #eaeaea;
    }

    .message .message__header {
      display: flex;
      align-items: flex-end;
      margin: 8px 8px 8px 16px;
      color: #eaeaea;
      font-weight: bold;
      font-size: 12px;
    }

    .message .message__provider {
      width: 16px;
      height: 15px;
      color: #eaeaea;
      margin: 0 8px;
    }

    .message .message__button {
      width: 20px;
      color: #636363;
    }

    .message .message__buttons {
      display: flex;
      flex-direction: column;
      min-width: 60px;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
    }

    .message .message__buttons .button {
      margin: 0 8px;
      width: 0;
      height: 0;
      overflow: hidden;
      opacity: 0;
      transition: width 0.15s ease-in-out 0.15s, height 0.15s ease-in-out 0.15s,
      opacity 0.25s ease-in-out 0.15s;
    }

    .message.message_focused::after {
      background: rgba(0, 0, 0, 0.2);
    }

    .message.message_focused .message__buttons .button {
      width: 30px;
      height: 30px;
      opacity: 1;
    }

    .message > * {
      position: relative;
      z-index: 1;
    }

    .message::after {
      content: "";
      position: absolute;
      top: -8px;
      left: -16px;
      right: -16px;
      bottom: -8px;
      z-index: 0;
      background: rgba(0, 0, 0, 0);
      transition: all 0.15s ease-in-out;
    }

    .message:hover::after {
      background: rgba(0, 0, 0, 0.1);
    }
  </style>
  <div class="message">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      style="display: none;"
    >
      <g id="corner">
        <path
          d="M0.999998 8.23205C-0.333335 7.46225 -0.333334 5.53775 0.999999 4.76795L7.75 0.870836C9.08333 0.101036 10.75 1.06329 10.75 2.60289L10.75 10.3971C10.75 11.9367 9.08333 12.899 7.75 12.1292L0.999998 8.23205Z"
          fill="currentColor"
        />
      </g>
      <g id="youtube">
        <path
          d="M9.21965 6.82144H9.59741C10.4282 6.82144 11.1015 6.17917 11.1015 5.3857V3.05212C11.1015 2.25865 10.4282 1.61638 9.59741 1.61638H9.21965C8.38745 1.61638 7.71557 2.25865 7.71557 3.05212V5.38703C7.71557 6.17917 8.38885 6.82144 9.21965 6.82144ZM8.84328 2.96247C8.84328 2.66542 9.09698 2.42457 9.40644 2.42457C9.72008 2.42457 9.97099 2.66542 9.97099 2.96247V5.47668C9.97099 5.77373 9.71869 6.01458 9.40644 6.01458C9.09559 6.01458 8.84328 5.7724 8.84328 5.47668V2.96247ZM12.9833 6.82144C13.7347 6.82144 14.3954 6.19255 14.3954 6.19255V6.73179H15.5245V1.61638H14.3954V5.56633C14.3954 5.56633 14.0177 6.01458 13.6427 6.01458C13.2649 6.01458 13.2649 5.7443 13.2649 5.7443V1.61638H12.1358V6.10424C12.1372 6.10424 12.2306 6.82144 12.9833 6.82144ZM4.79801 6.73312H6.11669V3.94996L7.62078 0H6.39688L5.45735 2.60387L4.51643 0H3.19914L4.79661 3.94996V6.73312H4.79801ZM12.2306 12.6795C11.9867 12.6795 11.7957 12.8186 11.666 12.9524V16.5732C11.7859 16.695 11.963 16.8141 12.2306 16.8141C12.7952 16.8141 12.7952 16.2106 12.7952 16.2106V13.2829C12.7952 13.2816 12.7018 12.6795 12.2306 12.6795ZM16.9352 7.94273C16.9352 7.94273 13.4824 7.77012 10.0198 7.77012C6.56973 7.77012 3.10574 7.94273 3.10574 7.94273C1.5459 7.94273 0.282974 9.09881 0.282974 10.5252C0.282974 10.5252 0 12.2004 0 13.8851C0 15.5603 0.282974 17.2436 0.282974 17.2436C0.282974 18.67 1.5459 19.8274 3.10574 19.8274C3.10574 19.8274 6.50421 20 10.0198 20C13.4169 20 16.9352 19.8274 16.9352 19.8274C18.4923 19.8274 19.7566 18.6713 19.7566 17.2436C19.7566 17.2436 20.0382 15.5469 20.0382 13.8851C20.0382 12.1884 19.7566 10.5252 19.7566 10.5252C19.7566 9.10015 18.4923 7.94273 16.9352 7.94273ZM5.92851 10.8704H4.51643V17.6744H3.19914V10.8704H1.78845V9.75045H5.92851V10.8704ZM9.50123 17.6744H8.37212V17.158C8.37212 17.158 7.71417 17.7601 6.96143 17.7601C6.2087 17.7601 6.11669 17.071 6.11669 17.071V11.7308H7.24441V16.7258C7.24441 16.7258 7.24441 16.984 7.62217 16.984C7.99854 16.984 8.37491 16.5532 8.37491 16.5532V11.7308H9.50402V17.6744H9.50123ZM13.9243 16.3832C13.9243 16.3832 13.9243 17.7614 12.8899 17.7614C12.2557 17.7614 11.8724 17.4389 11.666 17.1874V17.6744H10.4449V9.75045H11.666V12.3195C11.8542 12.1295 12.3128 11.7321 12.8899 11.7321C13.6427 11.7321 13.9243 12.3342 13.9243 13.1103V16.3832ZM18.3459 13.1973V14.9194H15.9929V16.2106C15.9929 16.2106 15.9929 16.8141 16.5574 16.8141C17.122 16.8141 17.122 16.2106 17.122 16.2106V15.6085H18.3445V16.5558C18.3445 16.5558 18.1549 17.7614 16.6508 17.7614C15.1454 17.7614 14.8638 16.5558 14.8638 16.5558V13.1973C14.8638 13.1973 14.8638 11.7321 16.6508 11.7321C18.4379 11.7321 18.3459 13.1973 18.3459 13.1973ZM16.5574 12.6795C15.9929 12.6795 15.9929 13.2816 15.9929 13.2816V14.0563H17.1234V13.2816C17.1234 13.2816 17.1234 12.6795 16.5574 12.6795Z"
          fill="currentColor"
        />
      </g>
      <g id="trovo">
        <path
          d="M 11.621094 19.375 C 11.570312 19.371094 11.40625 19.351562 11.257812 19.332031 C 9.941406 19.191406 8.535156 18.578125 7.382812 17.652344 C 7.058594 17.390625 6.523438 16.851562 6.28125 16.542969 C 5.632812 15.71875 5.152344 14.722656 4.867188 13.625 C 4.613281 12.628906 4.523438 11.835938 4.546875 10.675781 C 4.5625 9.835938 4.707031 9.929688 3.445312 9.988281 C 3.121094 10.003906 2.59375 10.023438 2.277344 10.03125 C 1.3125 10.0625 1.316406 10.066406 1.105469 8.753906 C 1.042969 8.375 0.996094 8.070312 0.929688 7.664062 C 0.898438 7.457031 0.851562 7.179688 0.832031 7.039062 C 0.808594 6.90625 0.773438 6.671875 0.753906 6.527344 C 0.730469 6.382812 0.691406 6.148438 0.671875 6.003906 C 0.648438 5.859375 0.605469 5.578125 0.574219 5.378906 C 0.542969 5.183594 0.5 4.902344 0.480469 4.757812 C 0.453125 4.613281 0.417969 4.382812 0.398438 4.246094 C 0.296875 3.578125 0.214844 3.03125 0.175781 2.792969 C 0.152344 2.648438 0.125 2.402344 0.117188 2.25 C 0.0898438 1.765625 0.144531 1.738281 0.9375 1.824219 C 1.453125 1.882812 1.609375 1.902344 2.503906 2.019531 C 3.296875 2.125 3.511719 2.15625 3.828125 2.199219 C 4 2.222656 4.265625 2.261719 4.414062 2.28125 C 4.972656 2.359375 5.519531 2.433594 5.785156 2.472656 C 5.933594 2.496094 6.199219 2.535156 6.371094 2.558594 C 6.542969 2.582031 6.8125 2.621094 6.972656 2.644531 C 7.808594 2.761719 7.695312 2.777344 8.015625 2.515625 C 9.320312 1.433594 11.066406 0.382812 11.992188 0.117188 C 12.480469 -0.0195312 12.703125 -0.0117188 12.949219 0.15625 C 13.125 0.277344 13.175781 0.351562 13.386719 0.859375 C 13.484375 1.09375 13.578125 1.3125 13.589844 1.339844 C 13.605469 1.371094 13.742188 1.707031 13.90625 2.082031 C 14.359375 3.160156 14.644531 3.707031 14.796875 3.78125 C 14.832031 3.796875 14.964844 3.824219 15.09375 3.84375 C 15.222656 3.863281 15.445312 3.894531 15.585938 3.914062 C 16.074219 3.984375 16.445312 4.039062 16.84375 4.09375 C 17.0625 4.125 17.367188 4.167969 17.527344 4.191406 C 17.6875 4.214844 17.914062 4.242188 18.03125 4.261719 C 18.152344 4.273438 18.324219 4.296875 18.414062 4.316406 C 18.578125 4.339844 18.980469 4.398438 19.796875 4.507812 C 20.964844 4.667969 21.007812 4.699219 20.78125 5.285156 C 20.722656 5.445312 20.613281 5.71875 20.550781 5.890625 C 20.480469 6.066406 20.324219 6.480469 20.199219 6.804688 C 20.074219 7.132812 19.910156 7.550781 19.84375 7.730469 C 19.355469 9.011719 19.371094 8.984375 19.195312 9.074219 C 19.027344 9.160156 18.960938 9.167969 17.144531 9.265625 C 13.308594 9.480469 12.636719 9.636719 11.757812 10.535156 C 10.878906 11.433594 10.503906 12.582031 10.679688 13.859375 C 10.855469 15.207031 11.667969 16.136719 12.871094 16.363281 C 13.3125 16.449219 13.839844 16.375 14.269531 16.167969 C 14.960938 15.835938 15.394531 15.171875 15.394531 14.441406 C 15.394531 13.875 15.152344 13.417969 14.742188 13.214844 C 14.578125 13.132812 14.539062 13.125 14.316406 13.125 C 14.105469 13.125 14.042969 13.140625 13.917969 13.199219 C 13.640625 13.332031 13.535156 13.476562 13.535156 13.734375 C 13.535156 13.953125 13.601562 14.078125 13.8125 14.28125 C 13.976562 14.429688 13.984375 14.441406 13.984375 14.574219 C 13.984375 14.898438 13.632812 15.074219 13.226562 14.953125 C 12.808594 14.824219 12.5 14.492188 12.355469 14.011719 C 12.273438 13.742188 12.269531 13.265625 12.351562 12.980469 C 12.582031 12.183594 13.242188 11.621094 14.109375 11.484375 C 14.339844 11.445312 14.917969 11.445312 15.148438 11.484375 C 16.144531 11.644531 16.960938 12.382812 17.308594 13.4375 C 17.441406 13.851562 17.480469 14.121094 17.480469 14.660156 C 17.480469 15.085938 17.46875 15.21875 17.421875 15.449219 C 17.230469 16.324219 16.855469 17.027344 16.21875 17.683594 C 15.351562 18.582031 14.15625 19.171875 12.878906 19.335938 C 12.632812 19.371094 11.78125 19.394531 11.621094 19.375 Z M 11.621094 19.375 "
          fill="currentColor"
        />
      </g>
    </svg>
    <div class="message__header">
      <svg viewBox="0 0 21 20" class="message__provider">
        <use xlink:href=""></use>
      </svg>
      <div class="message__author">
        Motherlode
      </div>
    </div>
    <div class="message__body">
      <svg viewBox="0 0 11 13" class="message__corner">
        <use xlink:href="#corner"></use>
      </svg>
      <div class="message__text">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vitae
        saepe molestiae, unde, laboriosam quod, fugiat iusto accusantium
        nulla dignissimos nostrum minima! Sequi, repudiandae ullam.
        Temporibus minima earum distinctio at a!
      </div>
      <div class="message__buttons">
        <button class="button button_round">
          <svg viewBox="0 0 17 17" class="button__icon message__button">
            <use xlink:href="#trash"></use>
          </svg>
        </button>
      </div>
    </div>
  </div>
`


class WCChatMessage extends HTMLElement {
  constructor() {
    super()

    this.attachShadow({mode: 'open'})
    this.shadowRoot.appendChild(template.content.cloneNode(true))

    this.my = false
    this.author = 'NO_AUTHOR'
    this.message = 'NO_MESSAGE'
    this.provider = 'NO_PROVIDER'

    this.$root = this.shadowRoot.querySelector('.message')
    this.$author = this.shadowRoot.querySelector('.message__author')
    this.$header = this.shadowRoot.querySelector('.message__header')
    this.$message = this.shadowRoot.querySelector('.message__text')
    this.$provider = this.shadowRoot.querySelector('.message__provider > use')
  }

  // properties to observe
  static get observedAttributes() {
    return ['my', 'author', 'message', 'provider']
  }

  // attribute changed
  attributeChangedCallback(property, oldValue, newValue) {
    this.updateAttrbute(property, oldValue, newValue)
  }

  updateAttrbute(property, oldValue, newValue) {
    if (oldValue === newValue) {
      return
    }

    this[property] = newValue

    this.$author.innerText = this.author
    this.$message.innerText = this.message
    this.$provider.setAttribute('href', `#${this.provider}`)

    if (property === 'my') {
      console.log('updateAttribute', newValue, !!newValue, typeof newValue)

      this.$root.classList.toggle('message_my', Boolean(newValue))
      this.$header.remove()
    }
  }

  handleMessageClick(event) {
    this.$root.classList.toggle('message_focused')
  }

  connectedCallback() {
    this.$author.innerText = this.author
    this.$message.innerText = this.message
    this.$provider.setAttribute('href', `#${this.provider}`)
    this.$root.classList.toggle('message_my', !!this.my)
    // this.$root.addEventListener('click', this.handleMessageClickBinded)
  }

  disconnectedCallback() {
    // this.$root.removeEventListener('click', this.handleMessageClickBinded)
  }
}

customElements.define('chat-message', WCChatMessage)
