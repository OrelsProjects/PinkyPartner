import { NextRequest, NextResponse } from "next/server";
import Logger from "@/loggerServer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/authOptions";
import prisma from "@/app/api/_db/db";

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
    const contract = await prisma.contract.findUnique({
      where: {
        contractId,
      },
      include: {
        userContracts: true,
      },
    });
    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 },
      );
    }
    if (
      contract.userContracts.every(
        userContract => userContract.userId !== session.user.userId,
      )
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch (error: any) {
    Logger.error("Error getting obligations", session.user.userId, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {}
