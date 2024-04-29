import { NextRequest, NextResponse } from "next/server";
import Logger from "@/loggerServer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/authOptions";
import prisma from "@/app/api/_db/db";
import { ObligationCompleted } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: { contractId: string; obligationId: string } },
): Promise<NextResponse<ObligationCompleted | any>> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const now = new Date();
    const { user } = session;
    const isOwner = await prisma.userContract.findFirst({
      where: {
        contractId: params.contractId,
        userId: user.userId,
      },
    });
    if (!isOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const completedObligation = await prisma.obligationCompleted.create({
      data: {
        obligationId: params.obligationId,
        contractId: params.contractId,
        userId: user.userId,
        completedAt: now,
      },
      include: {
        obligation: true,
        contract: true,
      },
    });
    return NextResponse.json(completedObligation, { status: 200 });
  } catch (error: any) {
    Logger.error("Error getting obligation", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
