import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { firebaseConfig, isConfigMissing } from '../firebase-config.js'

let db = null
if (!isConfigMissing) {
  const app = initializeApp(firebaseConfig)
  db = getDatabase(app)
}

export { db, isConfigMissing }
