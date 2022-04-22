import logger from './logger.js'
import { initDatabase } from './dataset.js'
import * as MailboxProcessor from './mailbox-processor.js'
import * as MailserverSender from './mailserver-sender.js'
import process from 'node:process'

process.on('SIGINT', () => {
  process.exit()
})

await initDatabase()
logger.info('App is initialized and running!')

MailboxProcessor.start()
MailserverSender.start()
