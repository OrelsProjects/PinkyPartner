import { NextRequest, NextResponse } from "next/server";
import loggerServer from "@/loggerServer";
import {
  NotificationMessage,
  sendNotification,
  Tokens,
} from "@/app/api/_utils/notification";
import moment from "moment";
import prisma from "@/app/api/_db/db";
import { UserId } from "@/lib/models/appUser";

export async function POST(req: NextRequest): Promise<any> {
  try {
    // get token from headers
    let token = req.headers.get("Authorization") || "";
    // remove "Bearer " from
    token = token?.replace("Bearer ", "");
    if (token !== process.env.DAILY_REMINDER_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const startOfDay = moment()
      .startOf("day")
      .subtract(1, "day")
      .toDate()
      .getTime();
    const endOfDay = moment().endOf("day").toDate().getTime();

    // get all userContractObligation that have dueDate between two hours before end of day and end of day
    const usersContractObligations =
      await prisma.userContractObligation.findMany({
        where: {
          AND: [
            {
              AND: [
                {
                  dueDate: {
                    gte: startOfDay,
                  },
                },
                {
                  dueDate: {
                    lte: endOfDay,
                  },
                },
              ],
            },
            // {
            //   completedAt: null,
            // },
            {
              userContract: {
                optOutOn: null,
              },
            },
            {
              appUser: {
                settings: {
                  dailyReminder: true,
                  showNotifications: true,
                },
              },
            },
          ],
        },
        include: {
          obligation: {
            select: {
              title: true,
            },
          },
          appUser: {
            include: {
              meta: {
                select: {
                  pushToken: true,
                  pushTokenMobile: true,
                },
              },
            },
          },
        },
      });

    const userMessages: {
      [key: UserId]: { message: NotificationMessage; token: Tokens };
    } = {};

    const nonCompletedUsersContractObligations =
      usersContractObligations.filter(
        userContractObligation => !userContractObligation.completedAt,
      );

    for (const userContractObligation of nonCompletedUsersContractObligations) {
      const { appUser } = userContractObligation;
      const { meta } = appUser;

      if (userMessages[appUser.userId]) {
        continue;
      }

      const message: NotificationMessage = {
        title: "Daily Reminder",
        body: `A friendly reminder to finish: ${userContractObligation.obligation.title.trim()}`,
        image: null,
        type: "daily-reminder",
        toUserId: appUser.userId,
      };

      const tokens: Tokens = {
        webToken: meta?.pushToken || null,
        mobileToken: meta?.pushTokenMobile || null,
      };

      userMessages[appUser.userId] = { message, token: tokens };
    }

    for (const userId in userMessages) {
      const { message, token } = userMessages[userId];
      await sendNotification(message, token);
    }

    return NextResponse.json(
      { message: "Daily reminder sent" },
      { status: 200 },
    );
  } catch (error: any) {
    loggerServer.error("Error sending daily reminder", "system", { error });
    return NextResponse.json(
      { error: "Error sending daily reminder" },
      { status: 500 },
    );
  }
}
