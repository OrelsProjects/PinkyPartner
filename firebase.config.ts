"use client";

import firebase from "firebase/compat/app";
import { FirebaseApp, initializeApp } from "firebase/app";
import { Messaging, getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};
// if app is not initialized, initialize it
let app: FirebaseApp | null =
  firebase.apps.length > 0 ? firebase.apps?.[0] : null;
let messaging: Messaging | null = null;
if (typeof window !== "undefined") {
  // Ensures this runs only in client-side
  app = !firebase.apps.length ? initializeApp(firebaseConfig) : firebase.app();
  messaging = getMessaging(app);
}

const getUserToken = async () => {
  if (!messaging) return;
  const token = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  });
  return token;
};

export { app, messaging, getUserToken };
