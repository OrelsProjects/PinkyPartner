import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../_db/db";
import { Logger } from "../../../../logger";
import { authOptions } from "../../../../authOptions";
import { AppUser, Contract, Obligation } from "@prisma/client";
import * as ClientContract from "../../../../models/contract";
import { formatObligations } from "../../_utils";

type UserData = {
  contracts: ClientContract.default[];
  obligations: Obligation[];
};

const formatContract = (contract: Contract, userId: string) => {
  return {
    ...contract,
    creatorId: contract.creatorId === userId ? userId : undefined,
  };
};

export async function GET(
  _: NextRequest,
): Promise<NextResponse<UserData | undefined>> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(undefined, { status: 401 });
  }

  try {
    const userObligations: Obligation[] = await prisma.obligation.findMany({
      where: {
        userId: session.user.userId,
      },
    });

    let contractIds = await prisma.userContract.findMany({
      where: {
        userId: session.user.userId,
      },
      select: {
        contractId: true,
      },
    });

    const contracts = await prisma.contract.findMany({
      where: {
        contractId: {
          in: contractIds.map(contract => contract.contractId),
        },
      },
      include: {
        userContracts: {
          include: {
            appUser: {
              select: {
                photoURL: true,
                displayName: true,
                userId: true,
              },
            },
          },
        },
        contractObligations: {
          include: {
            obligation: true,
          },
        },
      },
    });

    const contractsData: ClientContract.default[] = contracts.map(contract => {
      const { userContracts, contractObligations, ...contractData } = contract;
      const signatures = userContracts
        .filter(userContract => userContract.signedAt !== null)
        .map(signature => signature.appUser) as AppUser[];

      const obligations = contractObligations
        .map(co => co.obligation)
        .filter(obligation => obligation !== null) as Obligation[];

      const formattedContract = formatContract(
        contractData,
        session.user.userId,
      );
      const formattedObligations = formatObligations(obligations);
      const clientContract: ClientContract.default = {
        ...formattedContract,
        obligations: formattedObligations,
        contractees: userContracts.map(userContract => userContract.appUser),
        signatures,
      };
      return clientContract;
    });

    return NextResponse.json(
      { obligations: userObligations, contracts: contractsData },
      { status: 200 },
    );
  } catch (error: any) {
    Logger.error(error);
    return NextResponse.json(undefined, { status: 500 });
  }
}
