import { initializeApp } from "firebase/app";
import { onMessage } from "firebase/messaging";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const firebaseApp = initializeApp(firebaseConfig);

const messaging = getMessaging(firebaseApp);
debugger;
onMessage(messaging, payload => {
  console.log("[firebase-messaging-sw.js] Received message ", payload);
  debugger;
  // ...
});

onBackgroundMessage(messaging, payload => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload,
  );
  // Customize notification here
  const notificationTitle = "Background Message Title";
  const notificationOptions = {
    body: "Background Message body.",
    icon: "/firebase-logo.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// function addPushNotificationListener() {
//   if (!isNotificationSupported() || !isPermissionGranted()) {
//     return;
//   }

//   onMessage(messaging, payload => {
//     debugger;
//     console.log("Message received. ", payload);
//   });
//   onBackgroundMessage(messaging, payload => {
//     debugger;
//     console.log("Message received. ", payload);
//     self.registration.showNotification(notificationTitle, notificationOptions);
//   });

//   // navigator.serviceWorker.addEventListener("message", onClick);
//   // self.addEventListener("push", onClick);
// }
