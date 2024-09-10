import { NextRequest, NextResponse } from "next/server";
import Logger from "@/loggerServer";
import { getServerSession } from "next-auth";
import prisma from "@/app/api/_db/db";
import { authOptions } from "@/authOptions";
import { Contract, Obligation } from "@prisma/client";
import { ContractType, ContractWithExtras } from "@/models/contract";
import { AccountabilityPartner } from "@/models/appUser";

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

export async function GET(
  req: NextRequest,
  { params }: { params: { contractId: string } },
) {
  const session = await getServerSession(authOptions);
  // if (!session) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  try {
    const contract = await prisma.contract.findUnique({
      where: { contractId: params.contractId },
      include: {
        userContractObligations: {
          where: {
            userId: session?.user.userId,
          },
        },
        contractObligations: {
          include: {
            obligation: true,
          },
        },
        userContracts: {
          where: {
            optOutOn: null,
          },
          include: {
            appUser: true,
          },
        },
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 },
      );
    }

    const contractees = contract.userContracts.map(userContract => ({
      userId: userContract.userId,
      displayName: userContract.appUser.displayName,
      photoURL: userContract.appUser.photoURL,
      signedAt: userContract.signedAt,
    }));
    // all contractees that have signed the contract
    const signatures = contractees.filter(
      contractee => contractee.signedAt !== null,
    );
    const obligations = contract.contractObligations
      .map(co => co.obligation)
      .filter(obligation => obligation !== null) as Obligation[];
    const formattedContract: ContractWithExtras = {
      ...contract,
      type: contract.type as ContractType,
      obligations,
      contractees,
      signatures,
    };

    return NextResponse.json({ ...formattedContract }, { status: 200 });
  } catch (error: any) {
    Logger.error("Error getting contract", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
