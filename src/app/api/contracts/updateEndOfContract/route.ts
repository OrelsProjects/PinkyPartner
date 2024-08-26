import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/api/_db/db";
import loggerServer from "@/loggerServer";
import { messaging } from "@/../firebase.config.admin";
import { Contract } from "@prisma/client";

const buildTitle = (contractName: string) => {
  const firstTwelve = contractName.slice(0, 12);
  let contractNameShortened =
    contractName.length > 12 ? `${firstTwelve}...` : contractName;
  return `Your contract ${contractNameShortened} is ending today!`;
};

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
  try {
    loggerServer.info("Checking contracts end today", "system cron");
    const startOfDay = new Date();
    const endOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all contracts that have their due date today.
    const contracts = await prisma.contract.findMany({
      where: {
        dueDate: {
          gte: startOfDay,
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
        if (!userContract.signedAt) continue;

        if (userContract.appUser.userId !== "102926335316336979769") continue; // For testing purposes

        const user = userContract.appUser;
        const token = user.meta?.pushTokenMobile || "";
        const webToken = user.meta?.pushToken || "";

        const { userContracts, ...rest } = contract;
        await sendNotification(rest, token, webToken);
      }
    }

    return NextResponse.json({}, { status: 201 });
  } catch (error: any) {
    loggerServer.error("Error running cron job", "system-cron", {
      data: { error },
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
