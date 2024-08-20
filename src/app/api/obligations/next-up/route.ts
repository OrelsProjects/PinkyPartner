import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Logger from "@/loggerServer";
import { authOptions } from "@/authOptions";
import prisma from "../../_db/db";
import {
  UserContractObligationData,
  GetNextUpObligationsResponse,
} from "../../../../models/userContractObligation";
import {
  getStartOfTheWeekDate,
  getEndOfTheWeekDate,
} from "../../obligation/_utils";
import { createWeeksContractObligations } from "../../contract/_utils/contractUtils";
import moment from "moment";
import loggerServer from "@/loggerServer";
import { ANONYMOUS_USER_ID } from "../../../../lib/utils/consts";

export async function GET(
  req: NextRequest,
  { params }: { params: { contractIds: string[] } },
): Promise<NextResponse<GetNextUpObligationsResponse | { error: string }>> {
  let session = await getServerSession(authOptions);
  try {
    let isAnonymous = false;
    if (!session) {
      const anonymousUser = await prisma.appUser.findUnique({
        where: { userId: ANONYMOUS_USER_ID },
      });
      if (!anonymousUser) {
        loggerServer.error("Anonymous user not found", "", {
          data: { error: "" },
        });
        return NextResponse.json(
          { error: "Anonymous user not found" },
          { status: 404 },
        );
      }
      session = {
        expires: "",
        user: {
          userId: anonymousUser.userId,
          email: anonymousUser.email,
          name: anonymousUser.displayName,
          image: anonymousUser.photoURL,
          settings: {
            showNotifications: false,
            soundEffects: true,
          },
          meta: {
            referralCode: "",
            onboardingCompleted: false,
          },
        },
      };
      isAnonymous = true;
    }
    const { user } = session;
    const now = moment().utc().toDate();
    const oneMinuteAgo = moment().subtract(1, "minutes").toDate();
    const startOfWeekDate = isAnonymous
      ? oneMinuteAgo
      : getStartOfTheWeekDate();
    const endOfTheWeekDate = isAnonymous ? now : getEndOfTheWeekDate();
    const createdAt = isAnonymous ? oneMinuteAgo : new Date(0);

    const userContractIds = (
      await prisma.userContract.findMany({
        where: {
          userId: user.userId,
        },
        select: {
          contractId: true,
        },
      })
    )?.map(({ contractId }) => contractId);

    let signedContracts = await prisma.userContract.findMany({
      where: {
        AND: {
          contractId: {
            in: userContractIds,
          },
          optOutOn: null,
        },
        contract: {
          dueDate: {
            gte: now,
          },
          createdAt: {
            gte: createdAt,
          },
          userContracts: {
            some: {
              signedAt: {
                not: null,
              },
            },
          },
        },
      },
      include: {
        appUser: {
          select: {
            photoURL: true,
            displayName: true,
            userId: true,
          },
        },
        contract: {
          include: {
            userContracts: true,
            userContractObligations: {
              where: {
                dueDate: {
                  gte: startOfWeekDate,
                  lte: endOfTheWeekDate,
                },
              },
            },
            contractObligations: {
              include: {
                obligation: true,
              },
            },
          },
        },
      },
      orderBy: {
        contract: {
          createdAt: "desc",
        },
      },
    });

    signedContracts = signedContracts.filter(
      ({ contract }) =>
        contract.userContracts.filter(({ signedAt }) => signedAt != null)
          .length >= 1,
    );

    if (signedContracts.length === 0) {
      return NextResponse.json(
        {
          userContractObligations: [],
          partnersContractObligations: [],
        },
        { status: 200 },
      );
    }

    const allUserContractObligations: UserContractObligationData[] = [];

    for (const signedContract of signedContracts) {
      let userContractObligations =
        signedContract.contract.userContractObligations;

      if (signedContract.contract.userContractObligations.length === 0) {
        const contractObligations =
          signedContract.contract.contractObligations.map(
            ({ obligation }) => obligation,
          );
        userContractObligations = await createWeeksContractObligations(
          contractObligations,
          signedContract.contract,
          [signedContract.appUser.userId],
        );
      }

      const signedContractUser = signedContract.appUser;
      const usersContractObligations = userContractObligations.filter(
        ({ userId }) => userId === signedContract.userId,
      );

      for (const userContractObligation of usersContractObligations) {
        const obligation = signedContract.contract.contractObligations.find(
          ({ obligationId }) =>
            obligationId === userContractObligation.obligationId,
        )?.obligation;

        const appUser = {
          photoURL:
            userContractObligation.userId === user.userId
              ? user.image
              : signedContractUser.photoURL,
          displayName:
            userContractObligation.userId === user.userId
              ? user.name
              : signedContractUser.displayName,
          userId:
            userContractObligation.userId === user.userId
              ? user.userId
              : signedContractUser.userId,
        };

        allUserContractObligations.push({
          contractId: signedContract.contract.contractId,
          userContractObligationId:
            userContractObligation.userContractObligationId,
          obligationId: userContractObligation.obligationId,
          dueDate: userContractObligation.dueDate,
          completedAt: userContractObligation.completedAt,
          viewedAt: userContractObligation.viewedAt,
          userId: appUser.userId,
          appUser,
          obligation: obligation!,
          contract: signedContract.contract,
        });
      }
    }

    const userContractObligations = allUserContractObligations.filter(
      ({ appUser }) => appUser.userId === user.userId,
    );
    const partnersContractObligations = allUserContractObligations
      .filter(({ appUser }) => appUser.userId !== user.userId)
      .map(({ appUser, ...rest }) => ({
        partnerId: appUser.userId,
        contractObligations: [{ ...rest, appUser }],
      }));

    return NextResponse.json(
      {
        userContractObligations,
        partnersContractObligations,
      },
      { status: 200 },
    );
  } catch (error: any) {
    Logger.error(
      "Error getting obligations",
      session?.user?.userId || "unknown",
      error,
    );
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
