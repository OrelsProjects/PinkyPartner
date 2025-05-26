// Import necessary dependencies for logging and Firebase configuration
import { messaging } from "@/../firebase.config.admin";
import { NotificationType } from "@/lib/models/notification";

// Define the NotificationMessage interface, which specifies the structure of a notification message
export interface NotificationMessage {
  title: string; // Title of the notification
  toUserId: string; // ID of the user to whom the notification is sent
  type: NotificationType; // Type of the notification (e.g., message, alert)
  body: string | null; // Main content or body of the notification
  image: string | null; // URL of an image to include in the notification
  fromUserId?: string | null; // Optional: ID of the user sending the notification
  fromName?: string | null; // Optional: Name of the user sending the notification
  link?: string | null; // Optional: Link for web push notifications
}

// Define the Tokens interface to manage device tokens for web and mobile platforms
export interface Tokens {
  webToken: string | null; // Token for web notifications
  mobileToken: string | null; // Token for mobile notifications
}

// Function to send notifications to a specified user based on device tokens provided
export async function sendNotification(
  notificationMessage: NotificationMessage,
  tokens: Tokens,
) {
  // Extract details from the notification message for easier handling
  const { title, body, image, type, fromUserId, fromName, toUserId } =
    notificationMessage;

  // Construct the notification message structure for different platforms
  const message = {
    data: {
      title, // Notification title
      toUserId, // User ID (if needed for backend handling)
      body: body || "", // Notification content (empty if null)
      icon: process.env.LOGO_URL || "", // App icon in the notification
      badge: process.env.NOTIFICATION_URL || "", // Badge in the notification top bar
      image: image || "", // Image within the notification
      type: type || "", // Type of notification, if needed
      fromName: fromName || "", // Name of sender (optional, can be removed)
    },
    webpush: {
      fcmOptions: {
        link: notificationMessage.link || "pinkypartner.com", // Redirect URL when the notification is clicked
      },
    },
    apns: {
      // APNs-specific options for iOS notifications
      payload: {
        aps: {
          contentAvailable: true, // Enables background notifications on iOS
          threadId: type, // Groups notifications by type
        },
      },
      headers: {
        "apns-push-type": "background", // Sets notification as a background alert
        "apns-priority": "10", // Must be set to `5` for silent notifications on iOS
      },
    },
    android: {
      // Android-specific options
      notification: {
        icon: process.env.LOGO_URL || "", // Notification icon
        channelId: type, // Groups notifications in the same channel by type
        tag: type, // Groups notifications by tag
      },
    },
  };

  try {
    if (!tokens.mobileToken) {
      throw new Error("Mobile token is required");
    }
    // Attempt to send to mobile device first if mobile token exists
    await messaging.send({
      ...message,
      token: tokens.mobileToken || "", // Mobile device token
    });
  } catch (error: any) {
    // Log any error encountered during mobile notification delivery
    console.error(
      "Error sending mobile notification",
      fromUserId || "system", // Sender ID, default to "system" if no sender ID is provided
      {
        data: { error, token: tokens.mobileToken }, // Additional error data for debugging
      },
    );

    // If sending to mobile fails, fallback to web notification (if web token exists)
    if (tokens.webToken && tokens.webToken !== "no-token") {
      await messaging.send({
        ...message,
        token: tokens.webToken, // Web device token
      });
    }
  }
}
