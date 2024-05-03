import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/authOptions";
import prisma from "../../_db/db";
import { Logger } from "../../../../logger";
import UserContractObligation from "../../../../models/userContractObligation";
import {
  getStartOfTheWeekDate,
  getEndOfTheWeekDate,
} from "../../obligation/_utils";
import { createWeeksContractObligations } from "../../contract/_utils/contractUtils";

export type GetNextUpObligationsResponse = {
  userData: {
    toComplete: UserContractObligation[];
    completed: UserContractObligation[];
  };
  partnerData: {
    toComplete: UserContractObligation[];
    completed: UserContractObligation[];
  };
};

export async function GET(
  req: NextRequest,
  { params }: { params: { contractIds: string[] } },
): Promise<NextResponse<GetNextUpObligationsResponse | { error: string }>> {
  // const session = await getServerSession(authOptions);
  // if (!session) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }
  try {
    const allContractIds = params.contractIds?.[0].split(",");
    const uniqueContractIds = Array.from(new Set(allContractIds));
    // const { user } = session;
    const user = {
      userId: "102926335316336979769",
      photoURL: "",
      displayName: "",
    };
    const now = new Date();
    const startOfWeekDate = getStartOfTheWeekDate();
    const endOfTheWeekDate = getEndOfTheWeekDate();

    let signedContracts = await prisma.userContract.findMany({
      where: {
        contractId: {
          in: uniqueContractIds,
        },
        userId: {
          not: user.userId,
        },
        signedAt: {
          not: null,
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
    });

    signedContracts = signedContracts.filter(
      ({ contract }) =>
        contract.userContracts.filter(({ signedAt }) => signedAt != null)
          .length > 1,
    );

    if (signedContracts.length === 0) {
      return NextResponse.json(
        {
          userData: { toComplete: [], completed: [] },
          partnerData: { toComplete: [], completed: [] },
        },
        { status: 200 },
      );
    }

    const allUserContractObligations: UserContractObligation[] = [];

    for (const signedContract of signedContracts) {
      let userContractObligations =
        signedContract.contract.userContractObligations;
      if (signedContract.contract.userContractObligations.length === 0) {
        let newObligations = await createWeeksContractObligations(
          signedContract.contract.contractObligations.map(
            ({ obligation }) => obligation,
          ),
          signedContract.contract,
          [signedContract.appUser.userId, user.userId],
        );
        userContractObligations = newObligations.userContractObligations;
      }

      const signedContractUser = signedContract.appUser;

      for (const userContractObligation of userContractObligations) {
        const obligation = signedContract.contract.contractObligations.find(
          ({ obligationId }) =>
            obligationId === userContractObligation.obligationId,
        )?.obligation;
        signedContracts;

        const appUser = {
          photoURL:
            userContractObligation.userId === user.userId
              ? user.photoURL
              : signedContractUser.photoURL,
          displayName:
            userContractObligation.userId === user.userId
              ? user.displayName
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
          appUser,
          obligation: obligation!,
        });
      }
    }

    const userObligations = allUserContractObligations.filter(
      ({ appUser }) => appUser.userId === user.userId,
    );
    const partnerObligations = allUserContractObligations.filter(
      ({ appUser }) => appUser.userId !== user.userId,
    );

    const userObligationsToComplete: UserContractObligation[] =
      userObligations.filter(({ completedAt }) => !completedAt) || [];

    const userObligationsCompleted: UserContractObligation[] =
      userObligations.filter(({ completedAt }) => completedAt) || [];

    const partnerObligationsToComplete: UserContractObligation[] =
      partnerObligations.filter(({ completedAt }) => !completedAt) || [];

    const partnerObligationsCompleted: UserContractObligation[] =
      partnerObligations.filter(({ completedAt }) => completedAt) || [];

    return NextResponse.json(
      {
        userData: {
          toComplete: userObligationsToComplete,
          completed: userObligationsCompleted,
        },
        partnerData: {
          toComplete: partnerObligationsToComplete,
          completed: partnerObligationsCompleted,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    Logger.error("Error getting obligations", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
