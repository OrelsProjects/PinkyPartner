import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../../../authOptions";
import prisma from "../../_db/db";
import loggerServer from "@/loggerServer";
import { ContractsStats } from "../../../(content)/admin/page";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.userId != "102926335316336979769") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // get all contracts, grouped by cratorId, including appUsers' displayNname and email
    const contracts = await prisma.contract.findMany({
      include: {
        appUser: {
          select: {
            displayName: true,
            email: true,
          },
        },
        userContractObligations: {
          where: {
            completedAt: {
              not: null,
            },
          },
        },
      },
    });

    const groupedContracts: ContractsStats = contracts.reduce(
      (acc: ContractsStats, contract: any) => {
        const displayName = contract.appUser?.displayName || "unknown";
        const promisesDoneCount = contract.userContractObligations.length;

        if (!acc[displayName]) {
          acc[displayName] = {
            contractsCount: 0,
            promisesDoneCount: 0,
            email: contract.appUser?.email || "",
          };
        }
        if (contract.appUser) {
          acc[displayName].contractsCount =
            (acc[displayName].contractsCount || 0) + 1;
          acc[displayName].promisesDoneCount =
            (acc[displayName].promisesDoneCount || 0) + promisesDoneCount;
        }

        return acc;
      },
      {} as ContractsStats,
    );

    if (!contracts) {
      return NextResponse.json(
        { error: "Contracts not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(groupedContracts, { status: 200 });
  } catch (error: any) {
    loggerServer.error("Error fetching contract", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST() {}
