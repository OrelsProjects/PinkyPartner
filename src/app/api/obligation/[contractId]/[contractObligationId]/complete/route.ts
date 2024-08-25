import { NextRequest, NextResponse } from "next/server";
import Logger from "@/loggerServer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/authOptions";
import prisma from "@/app/api/_db/db";

export async function POST(
  req: NextRequest,
  { params }: { params: { contractId: string; contractObligationId: string } },
): Promise<NextResponse<any>> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
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

    const { completed } = await req.json();
    const now: Date | null = completed
      ? new Date(new Date().toUTCString())
      : null;

    const completedObligation = await prisma.userContractObligation.update({
      where: {
        userContractObligationId: params.contractObligationId,
        userId: user.userId,
      },
      data: {
        completedAt: now?.getDate(),
      },
    });
    return NextResponse.json(completedObligation, { status: 200 });
  } catch (error: any) {
    Logger.error("Error getting obligation", session.user.userId, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
