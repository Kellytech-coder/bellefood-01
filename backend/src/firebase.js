import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getCredential() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json) {
    try {
      return cert(JSON.parse(json));
    } catch {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON must be valid service-account JSON.");
    }
  }

  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
  if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
    return cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    });
  }

  throw new Error(
    "Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.",
  );
}

const app = getApps()[0] ?? initializeApp({
  credential: getCredential(),
  ...(process.env.FIREBASE_STORAGE_BUCKET
    ? { storageBucket: process.env.FIREBASE_STORAGE_BUCKET }
    : {}),
});

export const db = getFirestore(app);
