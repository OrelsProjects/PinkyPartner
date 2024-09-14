import loggerServer from "@/loggerServer";
import { messaging } from "@/../firebase.config.admin";
import { NotificationType } from "@/lib/features/notifications/notificationsSlice";

export interface NotificationMessage {
  title: string;
  toUserId: string;
  type: NotificationType;
  body: string | null;
  image: string | null;
  fromUserId?: string | null;
  fromName?: string | null;
  link?: string | null;
}

export interface Tokens {
  webToken: string | null;
  mobileToken: string | null;
}

export async function sendNotification(
  notificationMessage: NotificationMessage,
  tokens: Tokens,
) {
  const { title, body, image, type, fromUserId, fromName, toUserId } =
    notificationMessage;

  const message = {
    data: {
      title,
      toUserId,
      body: body || "",
      icon: process.env.LOGO_URL || "",
      badge: process.env.NOTIFICATION_URL || "", // icon on top of phnone
      image: image || "",
      type: type || "", // Include notification type in the data payload
      fromName: fromName || "",
    },
    webpush: {
      fcmOptions: {
        link: notificationMessage.link || "https://www.pinkypartner.com/home",
      },
    },
    apns: {
      payload: {
        aps: {
          contentAvailable: true,
          threadId: type,
        },
      },
      headers: {
        "apns-push-type": "background",
        "apns-priority": "10", // Must be `5` when `contentAvailable` is set to true.
      },
    },
    android: {
      notification: {
        icon: process.env.LOGO_URL || "",
        channelId: type,
        tag: type,
      },
    },
  };

  try {
    // Send to mobile
    await messaging.send({
      ...message,
      token: tokens.mobileToken || "",
    });
  } catch (error: any) {
    loggerServer.error(
      "Error sending mobile notification",
      fromUserId || "system",
      {
        data: { error, token: tokens.mobileToken },
      },
    );
  } finally {
    // Send to web
    if (tokens.webToken && tokens.webToken !== "no-token") {
      await messaging.send({
        ...message,
        token: tokens.webToken,
      });
    }
  }
}
