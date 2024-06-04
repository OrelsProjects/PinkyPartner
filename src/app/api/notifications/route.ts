import { NextRequest, NextResponse } from "next/server";
import Logger from "../../../loggerServer";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../authOptions";
import prisma from "../_db/db";
import { Contract, Obligation } from "@prisma/client";
import { messaging } from "../../../../firebase.config.admin";
import { NotificationData } from "../../../lib/features/notifications/notificationsSlice";

export async function POST(req: NextRequest): Promise<NextResponse<any>> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let token = "";
  try {
    const {
      title,
      body,
      image,
      userId,
      type,
    }: NotificationData & { userId: string } = await req.json();
    const user = await prisma.appUser.findUnique({
      where: { userId },
      include: {
        meta: {
          select: {
            pushToken: true,
            pushTokenMobile: true,
          },
        },
        settings: {
          select: {
            showNotifications: true,
            soundEffects: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.settings?.showNotifications) {
      return NextResponse.json(
        { error: "User has disabled notifications" },
        { status: 400 },
      );
    }

    token = user.meta?.pushToken || "";

    if (!token) {
      return NextResponse.json(
        { error: "User not subscribed to notifications" },
        { status: 400 },
      );
    }

    const message = {
      data: {
        title,
        body: body || "",
        icon: process.env.LOGO_URL || "/notification-icon.png",
        badge: "/notification-icon.png",
      },
      webpush: {
        fcmOptions: {
          link: "https://www.pinkypartner.com/home",
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
        token: user.meta?.pushTokenMobile || "",
      });
    } catch (error: any) {
      Logger.error("Error sending mobile notification", session.user.userId, {
        data: { error, token },
      });
    } finally {
      // Send to web
      await messaging.send({
        ...message,
        token,
      });
    }
    Logger.info("Notification sent", session.user.userId, {
      data: { message },
    });

    return NextResponse.json({}, { status: 201 });
  } catch (error: any) {
    Logger.error("Error sending notification", session.user.userId, {
      data: { error, token },
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
