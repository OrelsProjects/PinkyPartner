importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js",
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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(payload => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload,
  );

  // Define the notification options
  // const notificationOptions = {
  //   body: "No body",
  //   icon: payload.data.icon || '/default-icon.png',
  //   vibrate: [200, 100, 200, 100, 200, 100, 200],
  //   tag: payload.data.tag || '',
  //   image: payload.data.image || '',
  //   badge: payload.data.badge || ''
  // };

  // // Show notification
  // self.registration.showNotification(payload.data.title || "Notification", notificationOptions);
  const notificationTitle = "Background Message Title";
  const notificationOptions = {
    body: "Background Message body.",
    icon: "/favicon-32x32.png",
  };
  addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(clients.openWindow("https://www.pinkypartner.com/"));
  });
  self.registration.showNotification(notificationTitle, notificationOptions);

});

self.addEventListener('push', function (e) {
  // Skip if event is our own custom event
  if (e.custom) return;

  // Create a new event to dispatch
  var newEvent = new Event('push');
  newEvent.waitUntil = e.waitUntil.bind(e);
  newEvent.data = {
     json: function() {
         var newData = e.data.json();
         newData._notification = newData.notification;
         delete newData.notification;
         return newData;
     },
  };     
  newEvent.custom = true;          

  // Stop event propagation
  e.stopImmediatePropagation();

  // Dispatch the new wrapped event
  dispatchEvent(newEvent);
});