import settings from './settings.js'
import * as MailboxProcessor from './mailbox-processor.js'
import * as MailserverSender from './mailserver-sender.js'

MailboxProcessor.start()
MailserverSender.start()
