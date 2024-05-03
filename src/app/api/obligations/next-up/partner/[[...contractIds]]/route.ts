import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/authOptions";
import {
  ObligationsInContracts,
  getObligationsToComplete,
  getEndOfTheWeekDate,
  getStartOfTheWeekDate,
} from "../../../../obligation/_utils";
import prisma from "../../../../_db/db";
import { Logger } from "../../../../../../logger";
import { Obligation, ObligationCompleted } from "@prisma/client";

type UserBasicData = {
  photoURL: string;
  displayName: string;
  userId: string;
};

type ObligationCompletedWithUser = ObligationCompleted & {
  appUser?: UserBasicData;
};

export async function GET(
  req: NextRequest,
  { params }: { params: { contractIds: string[] } },
): Promise<
  NextResponse<
    | {
        toComplete: ObligationsInContracts;
        completed: ObligationCompletedWithUser[];
      }
    | { error: string }
  >
> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const allContractIds = params.contractIds?.[0].split(",");
    const uniqueContractIds = Array.from(new Set(allContractIds));
    const { user } = session;
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
            contractObligations: {
              include: {
                obligation: true,
              },
            },
            userContracts: true,
            obligationsCompleted: {
              where: {
                userId: {
                  not: user.userId,
                },
                completedAt: {
                  gte: startOfWeekDate,
                  lte: endOfTheWeekDate,
                },
              },
              include: {
                contract: true,
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
        { toComplete: [], completed: [] },
        { status: 200 },
      );
    }

    const allContractObligations: ObligationsInContracts =
      signedContracts.reduce((acc: ObligationsInContracts, userContract) => {
        const { contractObligations, ...contract } = userContract.contract;
        const obligations = contractObligations.map(
          ({ obligation }) => obligation as Obligation,
        );

        let appUser: UserBasicData | undefined = undefined;

        if (
          userContract.appUser?.displayName &&
          userContract.appUser?.photoURL
        ) {
          appUser = {
            userId: userContract.appUser.userId,
            photoURL: userContract.appUser.photoURL,
            displayName: userContract.appUser.displayName,
          };
        }

        acc.push({
          obligations,
          contract,
          appUser,
        });
        return acc;
      }, []);

    const obligationsCompleted: ObligationCompletedWithUser[] =
      signedContracts.flatMap(contract => {
        const appUser: UserBasicData = {
          userId: contract.appUser.userId,
          photoURL: contract.appUser.photoURL || "",
          displayName: contract.appUser.displayName || "",
        };
        const obligationsCompleted = contract.contract.obligationsCompleted.map(
          obligationCompleted => ({
            ...obligationCompleted,
            appUser,
          }),
        );
        return obligationsCompleted;
      });

    const obligationsToComplete = getObligationsToComplete(
      obligationsCompleted,
      allContractObligations,
    );

    return NextResponse.json(
      {
        toComplete: [...obligationsToComplete],
        completed: [...obligationsCompleted],
      },
      { status: 200 },
    );
  } catch (error: any) {
    Logger.error("Error getting obligations", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
