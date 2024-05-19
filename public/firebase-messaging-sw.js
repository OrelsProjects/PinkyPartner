importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js",
);

const firebaseConfig = {
  apiKey: "AIzaSyALZvbmwKVBUXia4-u2Wv__C6ST6GFbBUQ",
  authDomain: "myworkout-ca350.firebaseapp.com",
  projectId: "myworkout-ca350",
  storageBucket: "myworkout-ca350.appspot.com",
  messagingSenderId: "334976118267",
  appId: "1:334976118267:web:2547d2f91a0235d1aa2f5e",
  measurementId: "G-BTFG0DLT3J",
};

// Firebase Messaging setup and other service worker code here
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();
messaging.onBackgroundMessage(payload => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload,
  );
  // payload structure:
  /*
  {
    token: string;
    data: Record<string, string>;
  }
   */
  const title = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: payload.data.icon,
    vibrate: [200, 100, 200, 100, 200, 100, 200],
    tag: "",
    image: payload.data.image,
    badge: payload.data.badge,
  };
  self.registration.showNotification(title, notificationOptions);
});

self.addEventListener("notificationclick", event => {
  // Hide the notification
  event.notification.close();

  clients.openWindow("/home");
});
