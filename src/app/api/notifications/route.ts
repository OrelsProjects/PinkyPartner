import { NextRequest, NextResponse } from "next/server";
import Logger from "../../../loggerServer";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../authOptions";
import prisma from "../_db/db";
import { messaging } from "../../../../firebase.config.admin";
import { NotificationData } from "../../../lib/features/notifications/notificationsSlice";

const MIN_NUDGE_TIME = 4 * 60 * 60 * 1000; // 4 hours

const canNudge = async (userId: string) => {
  const lastNudgedAt = await prisma.nudges.findFirst({
    where: { userNudgedId: userId },
    orderBy: { nudgedAt: "desc" },
  });
  if (!lastNudgedAt) return 0;
  const now = new Date();
  const last = new Date(lastNudgedAt.nudgedAt);
  const diff = Math.abs(now.getTime() - last.getTime());
  return MIN_NUDGE_TIME - diff;
};

const updateNewNudge = async (userNudgedId: string, userNudgerId: string) => {
  await prisma.nudges.create({
    data: {
      userNudgedId,
      userNudgerId,
    },
  });
};

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
    const mobileToken = user.meta?.pushTokenMobile || "";
    if (!token && !mobileToken) {
      return NextResponse.json(
        { error: "User not subscribed to notifications" },
        { status: 400 },
      );
    }

    if (type === "nudge") {
      const nextNudgeTimeSeconds = await canNudge(userId);
      if (nextNudgeTimeSeconds > 0) {
        // time in hours
        const nextNudgeTimeHours = Math.floor(
          nextNudgeTimeSeconds / 1000 / 60 / 60,
        );
        const nextNudgeTimeMinutes = Math.floor(
          (nextNudgeTimeSeconds / 1000 / 60) % 60,
        );
        return NextResponse.json(
          { nextNudgeTimeSeconds, nextNudgeTimeHours, nextNudgeTimeMinutes },
          { status: 429 },
        );
      }
    }

    const message = {
      data: {
        title,
        body: body || "",
        icon: process.env.LOGO_URL || "",
        badge: process.env.NOTIFICATION_URL || "", // icon on top of phnone
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
        token: mobileToken || "",
      });
    } catch (error: any) {
      Logger.error("Error sending mobile notification", session.user.userId, {
        data: { error, token },
      });
    } finally {
      // Send to web
      if (token && token !== "no-token") {
        await messaging.send({
          ...message,
          token,
        });
      }
    }

    Logger.info("Notification sent", session.user.userId, {
      data: { message, type },
    });

    if (type === "nudge") {
      await updateNewNudge(userId, session.user.userId);
    }

    return NextResponse.json({}, { status: 201 });
  } catch (error: any) {
    Logger.error("Error sending notification", session.user.userId, {
      data: { error, token },
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
