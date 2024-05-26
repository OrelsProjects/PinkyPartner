import { NextRequest, NextResponse } from "next/server";
import Logger from "@/loggerServer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/authOptions";
import prisma from "@/app/api/_db/db";
import { UserContractObligation } from "@prisma/client";

export async function POST(
  req: NextRequest,
): Promise<NextResponse<{ error: string } | any>> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { obligations }: { obligations: UserContractObligation[] } = body;
    const obligationCompletedIds = obligations.map(
      obligation => obligation.userContractObligationId,
    );
    const now = new Date();
    await prisma.userContractObligation.updateMany({
      where: {
        userContractObligationId: {
          in: obligationCompletedIds,
        },
      },
      data: {
        viewedAt: now,
      },
    });

    return NextResponse.json({}, { status: 200 });
  } catch (error: any) {
    Logger.error("Error creating viewed", session.user.userId, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
