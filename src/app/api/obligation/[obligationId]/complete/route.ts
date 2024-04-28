import { NextRequest, NextResponse } from "next/server";
import Logger from "@/loggerServer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/authOptions";
import prisma from "@/app/api/_db/db";

export async function POST(
  req: NextRequest,
  { params }: { params: { contractId: string; obligationId: string } },
): Promise<any> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const now = new Date();
    const { user } = session;
    await prisma.obligationCompleted.create({
      data: {
        obligationId: params.obligationId,
        userId: user.userId,
        completedAt: now,
      },
    });
    return NextResponse.json({}, { status: 200 });
  } catch (error: any) {
    Logger.error("Error getting obligation", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
