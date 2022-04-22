import settings from './settings.js'
import logger from './logger.js'
import * as Dataset from './dataset.js'
import _ from 'lodash'
import nodemailer from 'nodemailer'
import { scheduleJob } from 'node-schedule'

const transporter = nodemailer.createTransport(settings.mailserverSender.smtp)

export async function sendNotification(subject, text) {
  return transporter.sendMail({
    envelope: {
      from: settings.mailserverSender.notification.envelopeFrom,
      to: settings.mailserverSender.notification.recipientAddress
    },
    from: settings.mailserverSender.notification.headerFrom,
    to: settings.mailserverSender.notification.recipientAddress,
    subject: subject
  })
}

async function sendRandomMail() {
  const randomRecipient = _.sample(settings.targetMailboxes).address
  const email = Dataset.getRandomEmail()

  logger.info(`Send random mail to ${randomRecipient}`)

  return transporter.sendMail({
    envelope: {
      from: settings.mailserverSender.randomEmail.envelopeFrom,
      to: randomRecipient
    },
    from: _.sample(settings.mailserverSender.randomEmail.headerFroms),
    to: randomRecipient,
    subject: email.subject,
    text: email.body
  })
}

var job

export function start() {
  job = scheduleJob(settings.mailserverSenderSchedule, async () => {
    await sendRandomMail().catch(err => logger.error(err))
  })
}
