import { readFile } from 'fs/promises'
import _ from 'lodash'

async function getOverrideSettings() {
  const settingsFilePath = process.env.SETTINGS_FILE_PATH

  if (settingsFilePath) {
    return JSON.parse(await readFile(new URL(settingsFilePath, import.meta.url)))
  } else {
    return {}
  }
}

const defaultSettings = JSON.parse(await readFile(new URL('./settings.default.json', import.meta.url)))
const overrideSettings = await getOverrideSettings()

export default _.merge({}, defaultSettings, overrideSettings)
