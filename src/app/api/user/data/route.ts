import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../_db/db";
import Logger from "@/loggerServer";
import { authOptions } from "../../../../authOptions";
import { Contract, Obligation } from "@prisma/client";
import * as ClientContract from "../../../../models/contract";
import { formatObligations } from "../../_utils";
import { ANONYMOUS_USER_ID } from "../../../../lib/utils/consts";
import loggerServer from "@/loggerServer";
import moment from "moment";

type UserData = {
  contracts: ClientContract.ContractWithExtras[];
  obligations: Obligation[];
};

const removeCreatorIdFromContract = (contract: Contract, userId: string) => {
  return {
    ...contract,
    creatorId: contract.creatorId === userId ? userId : undefined,
  };
};

export async function GET(
  _: NextRequest,
): Promise<NextResponse<UserData | undefined>> {
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
        return NextResponse.json(undefined, { status: 404 });
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

    if (!session) {
      return NextResponse.json(undefined, { status: 401 });
    }

    const userObligations: Obligation[] = await prisma.obligation.findMany({
      where: {
        userId: session.user.userId,
      },
    });

    const now = moment().utc().toDate();
    // If anonymous user, set the start of the week to 5 minutes ago. Otherwise, set to 1970
    const createdAt = isAnonymous
      ? moment().subtract(1, "minutes").toDate()
      : new Date(0);

    let contractIds = await prisma.userContract.findMany({
      where: {
        userId: session.user.userId,
      },
      select: {
        contractId: true,
      },
    });

    const contracts = await prisma.contract.findMany({
      where: {
        AND: {
          contractId: {
            in: contractIds.map(contract => contract.contractId),
          },
          userContracts: {
            some: {
              userId: session!.user.userId,
              optOutOn: null,
            },
          },
        },
        dueDate: {
          gte: now,
        },
        createdAt: {
          gte: createdAt,
        },
      },
      include: {
        userContracts: {
          where: {
            optOutOn: null,
          },  
          select: {
            appUser: {
              select: {
                photoURL: true,
                displayName: true,
                userId: true,
              },
            },
            signedAt: true,
          },
        },
        contractObligations: {
          include: {
            obligation: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const contractsData: ClientContract.ContractWithExtras[] = contracts.map(
      contract => {
        const { userContracts, contractObligations, ...contractData } =
          contract;
        const signatures = userContracts
          .filter(userContract => userContract.signedAt !== null)
          .map(signature => ({
            ...signature.appUser,
            signedAt: signature.signedAt,
          }));

        const obligations = contractObligations
          .map(co => co.obligation)
          .filter(obligation => obligation !== null) as Obligation[];

        const formattedContract = removeCreatorIdFromContract(
          contractData,
          session!.user.userId,
        );
        const formattedObligations = formatObligations(obligations);
        const clientContract: ClientContract.ContractWithExtras = {
          ...formattedContract,
          obligations: formattedObligations,
          contractees: userContracts.map(userContract => userContract.appUser),
          signatures,
        };
        return clientContract;
      },
    );

    return NextResponse.json(
      { obligations: userObligations, contracts: contractsData },
      { status: 200 },
    );
  } catch (error: any) {
    Logger.error("Error getting user data", session!.user.userId, error);
    return NextResponse.json(undefined, { status: 500 });
  }
}
