class ConfigService {
  /**
   * Config data
   * @type {object}
   */
  #config

  /**
   * @param {String|Object} filename - config filename, including extension OR config object itself
   */
  constructor(filename = 'config.json') {
    if (typeof filename === 'object') {
      this.#config = filename
    } else {
      this.#config = require(`../../${filename}`)
    }
  }

  /**
   * Returns config data by key
   * @param {string} [key]
   * @returns {ConfigService|string|Object.<string, string>|undefined}
   */
  get(key) {
    if (!key) {
      return this.#config
    }

    const config = this.#config[key]

    if (config && typeof config === 'object' && !Array.isArray(config)) {
      return new ConfigService(this.#config[key])
    }

    return this.#config[key]
  }
}

module.exports = ConfigService
