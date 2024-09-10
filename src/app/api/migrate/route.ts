import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/authOptions";
import prisma from "@/app/api/_db/db";
import loggerServer from "@/loggerServer";
import { AppUserSettings, UserContractObligation } from "@prisma/client";
import { badids } from "./badIds";

export async function POST(
  req: NextRequest,
  { params }: { params: { contractId: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(undefined, { status: 401 });
  }
  try {
    const env = process.env.NODE_ENV;
    if (env !== "development") {
      loggerServer.warn(
        "Clear route called in production",
        session.user?.userId || "unknown",
      );
      return NextResponse.json(
        { error: "Clear route can only be called in development" },
        { status: 400 },
      );
    }

    if (session.user?.userId !== "102926335316336979769") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only if route comes from localhost
    if (req.headers.get("host") !== "localhost:3000") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // const allUsers = await prisma.appUser.findMany();
    // const usersSettings: Omit<
    //   AppUserSettings,
    //   "appUserSettingsId" | "updatedAt"
    // >[] = [];
    // for (const user of allUsers) {
    //   const userCurrentSettings = await prisma.appUserSettings.findFirst({
    //     where: {
    //       userId: user.userId,
    //     },
    //   });
    //   if (!userCurrentSettings) {
    //     const settings: Omit<
    //       AppUserSettings,
    //       "appUserSettingsId" | "updatedAt"
    //     > = {
    //       userId: user.userId,
    //       showNotifications: true,
    //       soundEffects: true,
    //     };
    //     usersSettings.push(settings);
    //   }
    // }

    // await prisma.appUserSettings.createMany({
    //   data: usersSettings,
    // });

    // Find all that have dueDate that is DateTime and not Int or null
    const badIds = badids.map(it => it.userContractObligationId);
    // go over all the ids and set dueDateNumber and completedAtNumber to dueDate.getTime() and completedAt.getTime()
    const userContractObligations =
      await prisma.userContractObligation.findMany({
        where: {
          userContractObligationId: {
            in: badIds,
          },
        },
      });


    const allUserContractObligations =
      await prisma.userContractObligation.findMany();

    // for (const it of userContractObligations) {
    //   const {
    //     userContractObligationId,
    //     completedAtNumber,
    //     dueDateNumber,
    //     ...rest
    //   } = it;
    //   // WIth a transaction, delete all the obligations and then insert them again without dueDateNumber and completedAtNumber
    //   promises.push(
    //     prisma.$transaction([
    //       prisma.userContractObligation.delete({
    //         where: {
    //           userContractObligationId,
    //         },
    //       }),
    //       prisma.userContractObligation.create({
    //         data: {
    //           ...rest,
    //         },
    //       }),
    //     ]),
    //   );
    // }

    // const result = await Promise.allSettled(promises);

    return NextResponse.json({ message: "Contract signed" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
