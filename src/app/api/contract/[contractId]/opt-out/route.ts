import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../../../../authOptions";
import prisma from "../../../_db/db";
import axios from "axios";

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

    await prisma.userContract.delete({
      where: {
        userContractId: userContract.userContractId,
        userId: session.user.userId,
      },
    });

    const otherUserContract = await prisma.userContract.findFirst({
      where: {
        AND: {
          NOT: {
            userId: session.user.userId,
          },
          contractId,
        },
      },
    });

    let newOwner: string | undefined;
    if (otherUserContract && otherUserContract.signedAt) {
      newOwner = otherUserContract.userId;
      await prisma.contract.update({
        where: {
          contractId,
        },
        data: {
          creatorId: newOwner,
        },
      });
    }

    return NextResponse.json({ newOwner }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
