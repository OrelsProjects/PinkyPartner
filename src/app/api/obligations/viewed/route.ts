import { NextRequest, NextResponse } from "next/server";
import Logger from "@/loggerServer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/authOptions";
import prisma from "@/app/api/_db/db";
import { ObligationCompleted } from "@prisma/client";

export async function POST(
  req: NextRequest,
): Promise<NextResponse<{ error: string } | any>> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { obligations }: { obligations: ObligationCompleted[] } = body;
    const obligationCompletedIds = obligations.map(
      obligation => obligation.obligationCompletedId,
    );
    const now = new Date();
    await prisma.obligationCompleted.updateMany({
      where: {
        obligationCompletedId: {
          in: obligationCompletedIds,
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
