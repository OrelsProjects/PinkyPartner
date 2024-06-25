import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../../../authOptions";
import { NotificationData } from "../../../../lib/features/notifications/notificationsSlice";
import prisma from "../../_db/db";
import loggerServer from "../../../../loggerServer";
import Contract from "../../../../models/contract";

const buildTitle = (contractName: string) =>
  `Your contract ${contractName} is ending today!`;

const body = "Click to see your stats";

const sendNotification = async (
  contract: Contract,
  token?: string,
  webToken?: string,
) => {
  const type = "contract-end";
  const message = {
    data: {
      title: buildTitle(contract.title),
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
      token: token || "",
    });
  } catch (error: any) {
    loggerServer.error("Error sending mobile notification", "system-cron", {
      data: { error, token },
    });
  } finally {
    // Send to web
    if (webToken) {
      await messaging.send({
        ...message,
        token: webToken,
      });
    }
  }

  loggerServer.info("Notification sent", "system-cron", {
    data: { message, type },
  });
};

export async function POST(req: NextRequest): Promise<NextResponse<any>> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    loggerServer.info("Checking contracts end today", "system cron");
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    // Get all contracts that have their due date today.
    const contracts = await prisma.contract.findMany({
      where: {
        dueDate: {
          lte: endOfDay,
        },
      },
      include: {
        userContracts: {
          include: {
            appUser: {
              include: {
                meta: true,
              },
            },
          },
        },
      },
    });

    for (const contract of contracts) {
      for (const userContract of contract.userContracts) {
        const user = userContract.appUser;
        const token = user.meta?.pushTokenMobile || "";
        const webToken = user.meta?.pushToken || "";
        await sendNotification(contract, token, webToken);
      }
    }

    return NextResponse.json({}, { status: 201 });
  } catch (error: any) {
    loggerServer.error("Error running cron job", session.user.userId, {
      data: { error },
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
