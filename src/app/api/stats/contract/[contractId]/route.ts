import { NextRequest, NextResponse } from "next/server";
import Logger from "@/loggerServer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/authOptions";
import prisma from "@/app/api/_db/db";
import moment from "moment";
import { StatusReport, UserReport } from "@/lib/models/statusReport";
import { Obligation, UserContractObligation } from "@prisma/client";
import {
  getStartOfTheWeekDate,
  getEndOfTheWeekDate,
  getStartOfXWeeksAgoDate,
  getEndOfXWeeksAgoDate,
} from "../../../obligation/_utils";

type UserId = string;

export async function GET(
  req: NextRequest,
  { params }: { params: { contractId: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { contractId } = params;
    if (!contractId) {
      return NextResponse.json(
        { error: "Contract ID is required" },
        { status: 400 },
      );
    }

    const startOfWeek = getStartOfXWeeksAgoDate(1).getTime();
    const endOfWeek = getEndOfXWeeksAgoDate(1).getTime();

    const contractDetails = await prisma.contract.findUnique({
      where: {
        contractId,
      },
      include: {
        userContracts: {
          where: {
            signedAt: {
              not: null,
            },
          },
        },
        userContractObligations: {
          include: {
            obligation: true,
            appUser: {
              select: {
                displayName: true,
              },
            },
          },
          where: {
            dueDate: {
              gte: startOfWeek,
              lte: endOfWeek,
            },
          },
        },
      },
    });

    if (!contractDetails) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 },
      );
    }

    if (
      contractDetails.userContracts.every(
        userContract => userContract.userId !== session.user.userId,
      )
    ) {
      return NextResponse.json(
        { error: "Contract does not belong to user" },
        { status: 401 },
      );
    }

    const {
      userContracts,
      userContractObligations: allUserContractObligations,
      ...contract
    } = contractDetails;

    const allReports: StatusReport = {
      contract: contract,
      reports: [],
    };

    const userIdToContractObligations: Record<
      UserId,
      {
        obligation: Obligation;
        userContractObligations: UserContractObligation[];
      }[]
    > = allUserContractObligations.reduce(
      (acc, userContractObligation) => {
        const { obligation, ...rest } = userContractObligation;
        const userId = rest.userId;
        if (!acc[userId]) {
          acc[userId] = [];
        }

        const indexOfExistingObligation = acc[userId].findIndex(
          o => o.obligation.obligationId === obligation.obligationId,
        );

        if (indexOfExistingObligation !== -1) {
          acc[userId][indexOfExistingObligation].userContractObligations.push(
            rest,
          );
        } else {
          acc[userId].push({
            obligation,
            userContractObligations: [rest],
          });
        }
        return acc;
      },
      {} as Record<
        string,
        {
          obligation: Obligation;
          userContractObligations: UserContractObligation[];
        }[]
      >,
    );

    for (const userId of Object.keys(userIdToContractObligations)) {
      for (const {
        obligation,
        userContractObligations,
      } of userIdToContractObligations[userId]) {
        const userReport: UserReport = {
          timesCompleted: 0,
          timesMissed: 0,
          timesLate: 0,
          total: 0,
        };
        for (const userContractObligation of userContractObligations) {
          const completedAt = userContractObligation.completedAt
            ? moment.utc(userContractObligation.completedAt)
            : null;
          const dueDate = userContractObligation.dueDate
            ? moment.utc(userContractObligation.dueDate)
            : null;

          if (!completedAt) {
            userReport.timesMissed++;
          } else {
            userReport.timesCompleted++;
            if (dueDate && completedAt.isAfter(dueDate)) {
              userReport.timesLate++;
            }
          }

          userReport.total++;
        }

        const displayName = allUserContractObligations.find(
          o =>
            o.userContractObligationId ===
            userContractObligations[0].userContractObligationId,
        )?.appUser.displayName;

        allReports.reports.push({
          obligation,
          report: userReport,
          user: {
            displayName: displayName || "",
          },
        });
      }
    }

    return NextResponse.json(allReports, { status: 200 });
  } catch (error: any) {
    Logger.error("Error getting obligations", session.user.userId, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {}
