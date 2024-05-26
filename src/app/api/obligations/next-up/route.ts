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
import { Obligation } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: { contractIds: string[] } },
): Promise<NextResponse<GetNextUpObligationsResponse | { error: string }>> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    // const allContractIds = params.contractIds?.[0].split(",");
    // const uniqueContractIds = Array.from(new Set(allContractIds));
    const { user } = session;
    const now = new Date();
    const startOfWeekDate = getStartOfTheWeekDate();
    const endOfTheWeekDate = getEndOfTheWeekDate();

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
        contractId: {
          in: userContractIds,
        },
        contract: {
          dueDate: {
            gte: now,
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
          partnerContractObligations: [],
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
    const partnerContractObligations = allUserContractObligations.filter(
      ({ appUser }) => appUser.userId !== user.userId,
    );

    return NextResponse.json(
      {
        userContractObligations,
        partnerContractObligations,
      },
      { status: 200 },
    );
  } catch (error: any) {
    Logger.error("Error getting obligations", session.user.userId, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
