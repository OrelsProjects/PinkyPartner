import { NextRequest, NextResponse } from "next/server";
import Logger from "@/loggerServer";
import { getServerSession } from "next-auth";
import prisma from "../_db/db";
import { authOptions } from "../../../authOptions";
import { ContractWithExtras, CreateContract } from "../../../models/contract";
import { createWeeksContractObligations } from "./_utils/contractUtils";
import { ANONYMOUS_USER_ID } from "../../../lib/utils/consts";

export async function POST(
  req: NextRequest,
): Promise<NextResponse<{ error: string } | ContractWithExtras>> {
  const session = await getServerSession(authOptions);
  if (!session) {
    // return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    let { obligation, signatures, contractees, ...contractData } =
      data as CreateContract;
    let user = session?.user;
    if (!user) {
      const annonymousUser = await prisma.appUser.findUnique({
        where: { userId: ANONYMOUS_USER_ID },
        include: { meta: true },
      });
      if (!annonymousUser) {
        return NextResponse.json(
          { error: "Annonymous user not found" },
          { status: 404 },
        );
      }
      if (!obligation) {
        return NextResponse.json(
          { error: "Obligation is required" },
          { status: 400 },
        );
      }
      user = {
        userId: annonymousUser.userId,
        email: annonymousUser.email,
        name: annonymousUser.displayName,
        image: annonymousUser.photoURL,
        meta: {
          referralCode: annonymousUser.meta?.referralCode || "",
          onboardingCompleted: false,
        },
        settings: {
          showNotifications: false,
          soundEffects: true,
        },
      };
      contractees = [user];
      signatures = [user];
      obligation = {
        ...obligation,
        userId: user.userId,
      };
    }

    const now = new Date();

    const contractResponse = await prisma.contract.create({
      data: {
        ...contractData,
        creatorId: user.userId,
      },
    });

    const obligationWithId = await prisma.obligation.create({
      data: {
        ...obligation!,
      },
    });

    await prisma.contractObligation.createMany({
      data: {
        obligationId: obligationWithId.obligationId,
        contractId: contractResponse.contractId,
      },
    });

    for (const contractee of contractees) {
      await prisma.userContract.create({
        data: {
          contractId: contractResponse.contractId,
          userId: contractee.userId,
          signedAt: signatures
            .map(signature => signature.userId)
            .includes(contractee.userId)
            ? now
            : null,
        },
      });
    }
    await createWeeksContractObligations(
      [obligationWithId],
      contractResponse,
      contractees.map(contractee => contractee.userId),
    );

    const contract: ContractWithExtras = {
      contractId: contractResponse.contractId,
      creatorId: user.userId,
      dueDate: contractResponse.dueDate,
      title: contractResponse.title,
      description: contractResponse.description,
      createdAt: contractResponse.createdAt,
      obligations: [obligationWithId],
      signatures: [user],
      contractees,
    };

    return NextResponse.json({ ...contract }, { status: 200 });
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

    const contract = await prisma.contract.findUnique({
      where: { contractId },
    });

    if (contract?.creatorId !== session.user.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updatedContarct = await prisma.contract.update({
      where: { contractId },
      data: {
        ...contract,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
      },
    });
    return NextResponse.json({ result: updatedContarct }, { status: 200 });
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
