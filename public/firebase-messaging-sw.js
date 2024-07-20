importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js");

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

class CustomPushEvent extends Event {
  constructor(data) {
    super("push");
    Object.assign(this, data);
    this.custom = true;
  }
}

self.addEventListener("push", e => {
  if (e.custom) return;
  const oldData = e.data;
  const newEvent = new CustomPushEvent({
    data: {
      json() {
        const newData = oldData.json();
        newData.data = { ...newData.data, ...newData.notification };
        delete newData.notification;
        return newData;
      },
    },
    waitUntil: e.waitUntil.bind(e),
  });
  e.stopImmediatePropagation();
  dispatchEvent(newEvent);
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const { title, body, icon, badge, userId, ...restPayload } = payload.data;

  const notificationOptions = {
    body,
    icon,
    badge,
    data: { userId, ...restPayload },
    actions: [
      {
        action: "sendGoodJob",
        title: "Send Good Job",
        icon: 'icons/thumb_up-icon.png'
      }
    ],
    tag: restPayload.tag || "pinky-partner",
  };

  self.registration.showNotification(title, notificationOptions);
});

self.addEventListener("notificationclick", event => {
  if (event.action === "sendGoodJob") {
    sendResponseToServer(event.notification.data.userId);
  } else if (event.notification.data && event.notification.data.click_action) {
    self.clients.openWindow(event.notification.data.click_action);
  } else {
    self.clients.openWindow(event.currentTarget.origin);
  }
  event.notification.close();
});

function sendResponseToServer(userId) {
  const postUrl = 'https://pinkypartner.com/api/notification/respond';
  const postData = {
    title: "Good job!",
    userId: userId
  };
  
  fetch(postUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData)
  })
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}
