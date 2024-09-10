import { NextRequest, NextResponse } from "next/server";
import Logger from "@/loggerServer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/authOptions";
import prisma from "@/app/api/_db/db";
import { messaging } from "../../../../firebase.config.admin";
import { NotificationData } from "@/lib/features/notifications/notificationsSlice";

const MIN_NUDGE_TIME = 4 * 60 * 60 * 1000; // 4 hours

const canNudge = async (userIdToNotify: string, userNotifying: string) => {
  const lastNudgedAt = await prisma.nudges.findFirst({
    where: { userNudgedId: userIdToNotify, userNudgerId: userNotifying },
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

  let token = "";
  try {
    const {
      title,
      body,
      image,
      userId: userIdToNotify,
      type,
    }: NotificationData & { userId: string } = await req.json();

    if (!session && type !== "response") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.appUser.findUnique({
      where: { userId: userIdToNotify },
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
      const nextNudgeTimeSeconds = await canNudge(
        userIdToNotify,
        session?.user.userId || "",
      );
      if (nextNudgeTimeSeconds > 0) {
        // time in hours
        const hours = Math.floor(nextNudgeTimeSeconds / 1000 / 60 / 60);
        const minutes = Math.floor((nextNudgeTimeSeconds / 1000 / 60) % 60);

        const nextNudgeTimeHours = hours > 10 ? hours : `0${hours}`;
        const nextNudgeTimeMinutes = minutes > 10 ? minutes : `0${minutes}`;

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
        image: image || "",
        type: type || "", // Include notification type in the data payload
        toUserId: session?.user.userId || "",
        fromName: user.displayName || "",
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
      Logger.error(
        "Error sending mobile notification",
        session?.user.userId || "system",
        {
          data: { error, token },
        },
      );
    } finally {
      // Send to web
      if (token && token !== "no-token") {
        await messaging.send({
          ...message,
          token,
        });
      }
    }

    Logger.info("Notification sent", session?.user.userId || "system", {
      data: { message, type },
    });

    if (type === "nudge") {
      await updateNewNudge(userIdToNotify, session!.user.userId);
    }

    return NextResponse.json({}, { status: 201 });
  } catch (error: any) {
    Logger.error(
      "Error sending notification",
      session?.user.userId || "system",
      {
        data: { error, token },
      },
    );
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
