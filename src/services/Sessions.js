const {safeStorage} = require('electron')
const Store = require('electron-store')

class SessionsService {
  /**
   * Electron store instance
   * @type {ElectronStore<Record<string, unknown>>}
   */
  #store = new Store({
    name: 'ray-encrypted',
    watch: true,
    encryptionKey: 'this_only_obfuscates'
  })

  /**
   * Save value to storage with given key
   * @param {string} key
   * @param {*} value
   */
  set(key, value) {
    const buffer = safeStorage.encryptString(JSON.stringify(value))
    this.#store.set(key, buffer.toString('latin1'))
  }

  /**
   * Get value from the storage by key
   * @param {string} [key]
   * @param {*} [defaultValue]
   * @returns {*}
   */
  get(key, defaultValue) {
    if (key) {
      const result = this.#store.store[key]

      if (result) {
        // noinspection JSCheckFunctionSignatures
        return JSON.parse(safeStorage.decryptString(Buffer.from(result, 'latin1')))
      }

      return defaultValue
    }

    return {
      ...this.#store.store
    }
  }

  /**
   * Remove value from the storage by key
   * @param {string} key
   */
  remove(key) {
    this.#store.delete(key)
  }
}

module.exports = SessionsService
