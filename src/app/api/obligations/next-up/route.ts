import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/authOptions";
import {
  ObligationsCompletedWithObligation,
  ObligationsInContracts,
  getObligationsToComplete,
  getEndOfTheWeekDate,
  getStartOfTheWeekDate,
} from "../../obligation/_utils";
import prisma from "../../_db/db";
import { Logger } from "../../../../logger";
import { Obligation, ObligationCompleted } from "@prisma/client";

export async function GET(
  req: NextRequest,
): Promise<NextResponse<ObligationsInContracts | { error: string }>> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { user } = session;
    const now = new Date();
    const startOfWeekDate = getStartOfTheWeekDate();
    const endOfTheWeekDate = getEndOfTheWeekDate();

    let signedContracts = await prisma.userContract.findMany({
      where: {
        userId: user.userId,
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
        contract: {
          include: {
            contractObligations: {
              include: {
                obligation: true,
              },
            },
            userContracts: true,
          },
        },
      },
    });

    signedContracts = signedContracts.filter(
      ({ contract }) =>
        contract.userContracts.filter(({ signedAt }) => signedAt != null)
          .length > 1,
    );

    const allContractObligations: ObligationsInContracts =
      signedContracts.reduce((acc: ObligationsInContracts, userContract) => {
        const { contractObligations, ...contract } = userContract.contract;
        const obligations = contractObligations.map(
          ({ obligation }) => obligation as Obligation,
        );
        acc.push({
          obligations,
          contract,
        });
        return acc;
      }, []);

    const obligationsCompleted: ObligationCompleted[] =
      await prisma.obligationCompleted.findMany({
        where: {
          userId: user.userId,
          completedAt: {
            gte: startOfWeekDate,
            lte: endOfTheWeekDate,
          },
        },
      });

    const obligationsToComplete = getObligationsToComplete(
      obligationsCompleted,
      allContractObligations,
    );

    return NextResponse.json([...obligationsToComplete], { status: 200 });
  } catch (error: any) {
    Logger.error("Error getting obligations", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
