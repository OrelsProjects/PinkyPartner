messaging.onBackgroundMessage(payload => {
  const { title, body, icon, badge, userId, type, ...restPayload } =
    payload.data;

  // Define the default notification options
  const notificationOptions = {
    body,
    icon,
    badge,
    data: { userId, ...restPayload },
    tag: restPayload.tag || "pinky-partner",
  };

  // Check the type and conditionally add the action
  if (type === "obligation") {
    notificationOptions.actions = [
      {
        action: "sendGoodJob",
        title: "Send Good Job1",
      },
    ];
  } else {
    notificationOptions.click_action = restPayload.click_action || [];
  }

  // Display the notification
  self.registration.showNotification(title, notificationOptions);
});

self.addEventListener("notificationclick", event => {
  // Handle action button click
  if (event.action === "sendGoodJob") {
    sendResponseToServer(
      event.notification.data.toUserId,
      event.notification.data.fromName,
    );
  } else if (event.notification.data && event.notification.data.click_action) {
    // Handle other notification click actions
    self.clients.openWindow(event.notification.data.click_action);
  } else {
    // Default action: open application
    self.clients.openWindow(event.currentTarget.origin);
  }
  event.notification.close();
});

function sendResponseToServer(toUserId, fromName) {
  const postUrl = "api/notifications";
  const postData = {
    title: "Good job!",
    body: fromName + " is proud of you!",
    userId: toUserId,
    type: "response",
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
