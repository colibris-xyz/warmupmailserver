import settings from './settings.js'
import pino from 'pino'

export default pino({
  level: settings.logger.level,
  transport: {
    target: 'pino-pretty',
    options: {
      hideObject: true
    }
  }
})
