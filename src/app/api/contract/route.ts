import { NextRequest, NextResponse } from "next/server";
import Logger from "@/loggerServer";
import { getServerSession } from "next-auth";
import prisma from "../_db/db";
import { authOptions } from "../../../authOptions";
import Contract from "../../../models/contract";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const { obligationIds, signatures, ...contractData } = data;
    const now = new Date();

    const contract = await prisma.contract.create({
      data: { ...contractData, creatorId: session.user.userId },
    });

    await prisma.contractObligations.createMany({
      data: obligationIds.map((obligationId: string) => ({
        obligationId: obligationId,
        contractId: contract.contractId,
      })),
    });
    
    await prisma.contractSignatures.createMany({
      data: signatures.map((signature: string) => ({
        userId: signature,
        contractId: contract.contractId,
        signedAt: now,
      })),
    });

    await prisma.userContracts.create({
      data: {
        contractId: contract.contractId,
        userId: session.user.userId,
      },
    });

    return NextResponse.json(
      { result: { ...data, contractId: contract.contractId } },
      { status: 200 },
    );
  } catch (error: any) {
    Logger.error("Error creating contract", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contractId = req.nextUrl.searchParams.get("id") as string;
    const contract = await prisma.contract.findUnique({
      where: { contractId },
    });
    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ result: contract }, { status: 200 });
  } catch (error: any) {
    Logger.error("Error fetching contract", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contractId = req.nextUrl.searchParams.get("id") as string;
    const data = await req.json();
    const contract = await prisma.contract.update({
      where: { contractId },
      data,
    });
    return NextResponse.json({ result: contract }, { status: 200 });
  } catch (error: any) {
    Logger.error("Error updating contract", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contractId = req.nextUrl.searchParams.get("id") as string;
    await prisma.contract.delete({
      where: { contractId },
    });
    return NextResponse.json(
      { message: "Contract deleted successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    Logger.error("Error deleting contract", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
