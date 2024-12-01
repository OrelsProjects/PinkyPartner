importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js",
);

/**
 * Here you'll need to hard code your Firebase configuration.
 * 
 * .env files are not accessible in service workers.
 * 
 * In a service worker file, directly using .env variables isn’t possible
 * because .env files are parsed and loaded by your server environment (like Node.js)
 * or bundler (such as Webpack, Vite, or Parcel) during build time,
 * and service workers typically run in the browser environment
 * without direct access to the server's environment variables.
 */
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: "",
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
        delete newData.notification; // Avoid duplication
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
  const { title, body, icon, badge, userId, type, ...restPayload } =
    payload.data;

  // Define the default notification options
  const notificationOptions = {
    body,
    icon,
    badge,
    data: { userId, ...restPayload },
    tag: restPayload.tag || "your-tag",
  };

  // Check the type and conditionally add the action
  if (type === "your-type") {
    notificationOptions.actions = [
      {
        action: "title-of-action",
        title: "",
      },
    ];
  }

  // Display the notification
  self.registration.showNotification(title, notificationOptions);
});

// Handle notification click event
self.addEventListener("notificationclick", event => {
  // Handle action button click
  if (event.action === "your-type") {
    sendResponseToServer({
      toUserId: event.notification.data.toUserId,
      // Other data you need
    });
  } else if (event.notification.data && event.notification.data.click_action) {
    // Handle other notification click actions
    self.clients.openWindow(event.notification.data.click_action);
  } else {
    // Default action: open application
    self.clients.openWindow(event.currentTarget.origin);
  }

  event.notification.close();
});

/**
 * This is needed if you want to create an async action button in your notification
 */
function sendResponseToServer({ toUserId, ...props }) {
  const postUrl = "api/notifications";
  const postData = {
    title: "your-title",
    body: "body-of-notification",
    userIdToNotify: toUserId,
    type: "type-if-needed",
  };

  fetch(postUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  })
    .then(data => {
      console.log("Success:", data);
    })
    .catch(error => {
      console.error("Error:", error);
    });
}
