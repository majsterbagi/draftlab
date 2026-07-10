import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { firebaseConfig, isConfigMissing } from '../firebase-config.js';

let db = null;
if (!isConfigMissing) {
  db = getDatabase(initializeApp(firebaseConfig));
}

export { db, isConfigMissing };
