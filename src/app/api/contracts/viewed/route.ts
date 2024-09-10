import { NextRequest, NextResponse } from "next/server";
import Logger from "@/loggerServer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/authOptions";
import prisma from "@/app/api/_db/db";

export async function POST(
  req: NextRequest,
): Promise<NextResponse<{ error: string } | any>> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { contractIds }: { contractIds: string[] } = body;
    const now = new Date();
    await prisma.userContract.updateMany({
      where: {
        userId: session.user.userId,
        contractId: {
          in: contractIds,
        },
      },
      data: {
        viewedAt: now,
      },
    });

    return NextResponse.json({}, { status: 200 });
  } catch (error: any) {
    Logger.error("Error creating viewed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
