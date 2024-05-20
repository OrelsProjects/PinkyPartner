import { NextRequest, NextResponse } from "next/server";
import Logger from "../../../loggerServer";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../authOptions";
import prisma from "../_db/db";
import { Contract, Obligation } from "@prisma/client";
import { messaging } from "../../../../firebase.config.admin";
import { NotificationData } from "../../../lib/features/notifications/notificationsSlice";

interface SendNotificationBody {
  contract: Contract;
  obligation: Obligation;
  userId: string;
}

export async function POST(req: NextRequest): Promise<NextResponse<any>> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const {
      title,
      body,
      image,
      userId,
    }: NotificationData & { userId: string } = await req.json();
    const user = await prisma.appUserMetadata.findUnique({
      where: { userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const token = user.pushToken;

    if (!token) {
      return NextResponse.json(
        { error: "User not subscribed to notifications" },
        { status: 400 },
      );
    }
    const message = {
      token,
      data: {
        title,
        body: body || "",
        image: image || "",
        icon: image || "",
        badge: image || "",
      },
      notification: {
        title,
        body: body || "",
        image: image || "",
      },
      android: {
        priority: "high",
      },
      apns: {
        payload: {
          aps: {
            contentAvailable: true,
          },
        },
        headers: {
          "apns-push-type": "background",
          "apns-priority": "10", // Must be `5` when `contentAvailable` is set to true.
        },
      },
    };

    const imageUrl = process.env.LOGO_URL;
    if (imageUrl && !message.data.image) {
      message.data.image = imageUrl;
      message.data.icon = imageUrl;
      message.data.badge = imageUrl;
      message.notification.image = imageUrl;
    }

    console.log("Sending notification", message);
    await messaging.send({
      token,
      data: {
        title,
        body: body || "",
        image: process.env.LOGO_URL || "",
        icon: process.env.LOGO_URL || "",
        badge: process.env.LOGO_URL || "",
      },
      webpush: {
        fcmOptions: {
          link: "https://www.pinkypartner.com",
        },
      },
      android: {
        priority: "high",
      },
      apns: {
        payload: {
          aps: {
            contentAvailable: true,
          },
        },
        headers: {
          "apns-push-type": "background",
          "apns-priority": "10", // Must be `5` when `contentAvailable` is set to true.
        },
      },
    });

    return NextResponse.json({}, { status: 201 });
  } catch (error: any) {
    Logger.error("Error sending notification", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
