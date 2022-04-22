import settings from './settings.js'
import Path from 'path'
import { cwd } from 'process'
import sqlite from 'better-sqlite3'

const db = sqlite(Path.join(cwd(), `${settings.databaseRelativePath}/emails.db`))
const { maxRowId } = db.prepare('SELECT max(rowid) AS maxRowId FROM emails').get()

export function getRandomEmail() {
  return db.prepare(`SELECT * FROM emails WHERE rowid > (ABS(RANDOM()) % ${maxRowId}) LIMIT 1`).get()
}
