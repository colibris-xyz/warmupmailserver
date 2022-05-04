import settings from './settings.js'
import logger from './logger.js'
import { promisify } from 'node:util'
import os from 'node:os'
import { mkdtemp, rm, stat } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import stream from 'node:stream'
import path from 'node:path'
import got from 'got'
import decompress from 'decompress'
import decompressTargz from 'decompress-targz'
import sqlite from 'better-sqlite3'
const pipeline = promisify(stream.pipeline)

const DATABASE_FILENAME = 'emails.db'

let db
let maxRowId

export async function initDatabase() {
  if (! await isDatabaseExists()) {
    await downloadDatabase()
  }
  db = sqlite(path.resolve('data/emails.db'))
  maxRowId = db.prepare('SELECT max(rowid) AS maxRowId FROM emails').get().maxRowId
}

export function getRandomEmail() {
  return db.prepare(`SELECT * FROM emails WHERE rowid > (ABS(RANDOM()) % ${maxRowId}) LIMIT 1`).get()
}

async function isDatabaseExists() {
  try {
    await stat(path.resolve('data/' + DATABASE_FILENAME))
    return true
  } catch (e) {
    return false
  }
}

async function downloadDatabase() {
  logger.info('Database file not found! Please wait while we download it...')

  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'warmupmailserver-'))

  const downloadStream = got.stream(settings.database.downloadUrl)

  downloadStream.on("downloadProgress", ({ transferred, total, percent }) => {
    const percentage = Math.round(percent * 100)
    logger.debug(`Download progress: ${transferred}/${total} (${percentage}%)`)
  })

  await pipeline(downloadStream, createWriteStream(tempDir + '/database.tar.gz'))

  logger.info('Download complete! Please wait while we uncompress it...')

  await decompress(tempDir + '/database.tar.gz', 'data/', {plugins: [decompressTargz()]})

  await rm(tempDir, {recursive: true})
}
