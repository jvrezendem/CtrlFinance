import { writeFileSync } from "node:fs";

const required = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const missing = Object.entries(required)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missing.length) {
  throw new Error(`Missing Firebase config values: ${missing.join(", ")}`);
}

const config = {
  ...required,
  ...(process.env.FIREBASE_MEASUREMENT_ID ? { measurementId: process.env.FIREBASE_MEASUREMENT_ID } : {})
};

const output = `export const firebaseConfig = ${JSON.stringify(config, null, 2)};\n`;
writeFileSync("public/src/firebase-config.js", output, "utf8");
