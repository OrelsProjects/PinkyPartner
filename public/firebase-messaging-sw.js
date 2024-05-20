importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

const firebaseConfig = {
  apiKey: "AIzaSyALZvbmwKVBUXia4-u2Wv__C6ST6GFbBUQ",
  authDomain: "myworkout-ca350.firebaseapp.com",
  projectId: "myworkout-ca350",
  storageBucket: "myworkout-ca350.appspot.com",
  messagingSenderId: "334976118267",
  appId: "1:334976118267:web:2547d2f91a0235d1aa2f5e",
  measurementId: "G-BTFG0DLT3J"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);

  // Define the notification options
  const notificationOptions = {
    body: "No body",
    icon: payload.data.icon || '/default-icon.png',
    vibrate: [200, 100, 200, 100, 200, 100, 200],
    tag: payload.data.tag || '',
    image: payload.data.image || '',
    badge: payload.data.badge || ''
  };

  // Show notification
  self.registration.showNotification(payload.data.title || "Notification", notificationOptions);
});