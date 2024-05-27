import { NextRequest, NextResponse } from "next/server";
import Logger from "@/loggerServer";
import { getServerSession } from "next-auth";
import prisma from "../../_db/db";
import { authOptions } from "../../../../authOptions";
import { Contract } from "@prisma/client";

type ContractUpdateBody = Pick<Contract, "title" | "description">;

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const isObligationOwner = await prisma.obligation.findFirst({
      where: {
        obligationId: params.id,
        userId: session.user.userId,
      },
    });
    if (!isObligationOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await prisma.obligation.delete({
      where: { obligationId: params.id },
    });
    return NextResponse.json(
      { message: "Obligation deleted successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    Logger.error("Error deleting obligation", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { contractId: string } },
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description } = body as ContractUpdateBody;
    await prisma.contract.update({
      where: { contractId: params.contractId },
      data: { title, description },
    });
    return NextResponse.json({}, { status: 200 });
  } catch (error: any) {
    Logger.error("Error updating obligation", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
