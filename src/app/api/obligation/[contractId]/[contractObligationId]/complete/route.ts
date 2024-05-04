import { NextRequest, NextResponse } from "next/server";
import Logger from "@/loggerServer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/authOptions";
import prisma from "@/app/api/_db/db";

export async function POST(
  req: NextRequest,
  { params }: { params: { contractId: string; userContractObligationId: string } },
): Promise<NextResponse<any>> {
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

    const completedObligation = await prisma.userContractObligation.update({
      where: {
        userContractObligationId: params.userContractObligationId,
      },
      data: {
        completedAt: now,
      },
    });
    return NextResponse.json(completedObligation, { status: 200 });
  } catch (error: any) {
    Logger.error("Error getting obligation", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
