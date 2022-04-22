import settings from './settings.js'
import logger from './logger.js'
import * as Dataset from './dataset.js'
import { sendNotification } from './mailserver-sender.js'
import _ from 'lodash'
import { ImapFlow } from 'imapflow'
import { scheduleJob } from 'node-schedule'

const mailboxes = settings.targetMailboxes

if (!mailboxes.length) {
  throw 'Error: you must configure at least one mailbox'
}

async function processRandomMailbox() {
  const mailbox = _.sample(mailboxes)

  logger.info(`Read and delete all mails for ${mailbox.address}`)

  const client = new ImapFlow({ ...mailbox.imap, auth: mailbox.auth, logger: logger.child({name: 'imap-flow'}) })

  await client.connect()
  await client.mailboxOpen('INBOX')

  const inboxMessages = []
  for await (const message of client.fetch({all: true}, {uid: true})) {
    inboxMessages.push(message);
  }

  if (inboxMessages.length) {
    const uids = inboxMessages.map(message => message.uid)

    await client.messageFlagsAdd(uids, ['\\Seen'], {uid: true})
    await client.messageDelete(uids, {uid: true})
  }

  logger.info(`${inboxMessages.length} mails processed with success.`)

  await client.mailboxClose('INBOX')
  await client.mailboxOpen('JUNK')

  const junkMessages = []
  for await (const message of client.fetch({all: true}, {uid: true})) {
    junkMessages.push(message);
  }

  if (junkMessages.length) {
    logger.warn(`Found ${junkMessages.length} messages in junk folder!`)
    await sendNotification(`[warmupmailserver] Warning, spam detected in ${mailbox.address} mailbox!`)
    await client.messageDelete(junkMessages.map(message => message.uid), {uid: true})
  }

  await client.logout()
}

var job

export function start() {
  job = scheduleJob(settings.mailboxProcessorSchedule, async () => {
    await processRandomMailbox().catch(err => logger.error(err))
  })
}
