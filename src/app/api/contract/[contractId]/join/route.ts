import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions, createNewUserContract } from "@/authOptions";
import prisma from "@/app/api/_db/db";
import { ContractFullError } from "../../../../../models/errors/ContractFullError";
import { UserNotPremiumError } from "../../../../../models/errors/UserNotPremiumError";

export async function POST(
  req: NextRequest,
  { params }: { params: { contractId: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(undefined, { status: 401 });
  }
  try {
    const { contractId } = params;
    if (!contractId) {
      throw new Error("Missing contractId");
    }

    await createNewUserContract(session.user.userId, contractId);

    const userContract = await prisma.userContract.findFirst({
      where: {
        AND: {
          userId: session.user.userId,
          contractId,
        },
      },
    });
    if (!userContract) {
      return NextResponse.json(undefined, { status: 401 });
    }
    userContract.signedAt = new Date();

    await prisma.userContract.update({
      where: {
        userContractId: userContract.userContractId,
      },
      data: {
        signedAt: userContract.signedAt,
      },
    });

    return NextResponse.json({ message: "Contract signed" }, { status: 200 });
  } catch (err: any) {
    if (err instanceof ContractFullError || err instanceof UserNotPremiumError) {
      return NextResponse.json({ error: err }, { status: 403 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
