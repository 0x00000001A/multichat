const fs = require('fs')
const chalk = require('chalk')

class Logger {
  static log(...message) {
    const causer = Logger.#getCallee()

    console.log(`[ ${causer.callee} ]`, ...message)
  }

  static warning(...message) {
    const causer = Logger.#getCallee()

    console.log(chalk.yellow(`[ ${causer.callee} ]`), ...message)
  }


  static success(...message) {
    const causer = Logger.#getCallee()

    console.log(chalk.green(`[ ${causer.callee} ]`), ...message)
  }

  static error(...message) {
    const causer = Logger.#getCallee()

    console.log(chalk.red(`[ ${causer.callee} ]`), ...message)
  }

  static info = (...message) => {
    const causer = Logger.#getCallee()

    console.log(chalk.blue(`[ ${causer.callee} ]`), ...message)
  }

  /**
   * Sexy object log
   * @param {string} message - Message to show
   * @param {Array|Object} obj - Object to log
   * @param {number} [level=0] - indent level. Should not be specified
   * @param {string[]} [output=[]] - Result to output. Should not be specified
   * @param {boolean} [isInner=false] - Indicates, if its a recursive call
   */
  static object(message, obj, level = 0, output = [], isInner = false) {
    if (!isInner) {
      console.log(chalk.blue(Logger.hr(message)))
    }

    const result = Object.keys(obj).map((objectKey) => {
      const prefix = Array(level).fill(' | ').join('')
      const coloredKey = chalk.red(objectKey)

      const innerResult = [`${prefix} ${coloredKey}:`]
      const objectValue = obj[objectKey]

      if (typeof objectValue === 'object') {
        innerResult.push(...Logger.object(message, objectValue, level + 1, output, true))
        return innerResult.join('\n')
      } else {
        switch (typeof objectValue) {
          case 'bigint':
          case 'number':
            innerResult.push(chalk.green(objectValue))
            break
          case 'string':
            innerResult.push(chalk.yellow(`"${objectValue}"`))
            break
          case 'boolean':
          case 'undefined':
            innerResult.push(chalk.magenta(objectValue))
            break
          default:
            innerResult.push(chalk.white(objectValue))
        }
      }

      return innerResult.join('')
    })

    if (isInner) {
      return result
    }

    console.log(result.join('\n'))
    console.log(chalk.blue(Logger.hr()))
  }

  /**
   * Returns a string, filled with symbols (default is '=').
   * The length of the string equals to terminal width.
   * @param {string} [heading='']
   * @param {string} [symbol==]
   */
  static hr(heading = '', symbol = '=') {
    const line = Array(process.stdout.columns).fill('=')

    if (heading) {
      const title = `[ ${heading} ]`
      return [title, ...line.slice(title.length)].join('')
    }

    return line.join('')
  }

  static #getCallee() {
    return (
      Error().stack
        .toString()
        .split('\n')
        .reduce((accumulator, message) => {
          if (!message.match(/([a-zA-Z.]+)\s\(/)) {
            return accumulator
          }

          const parts = message.trim().split(' ')

          if (parts.length < 3) {
            return accumulator
          }

          const callee = parts.at(1)
          const reference = parts.at(2).substring(1).slice(0, -1)
          const filepath = reference.split(':').at(0)

          if (filepath.indexOf('node_modules') >= 0 || !fs.existsSync(filepath)) {
            return accumulator
          }

          return {callee, filepath, reference}
        }, {
          callee: 'Logger',
          filepath: null,
          referende: null
        })
    )
  }
}

module.exports = Logger
