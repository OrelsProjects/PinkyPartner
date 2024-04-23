import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../_db/db";
import { Logger } from "../../../../logger";
import { authOptions } from "../../../../authOptions";
import { AppUser, Contract, Obligation } from "@prisma/client";
import * as ClientContract from "../../../../models/contract";
import * as ClientObligation from "../../../../models/obligation";

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

const formatObligations = (
  obligations: Obligation[],
): ClientObligation.default[] => {
  return obligations.map(obligation => {
    return {
      ...obligation,
      repeat: obligation.repeat as ClientObligation.ObligationRepeat,
      days: obligation.days as ClientObligation.Days,
      timesAWeek: obligation.timesAWeek as ClientObligation.TimesAWeek,
    };
  });
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

    let contractIds = await prisma.userContracts.findMany({
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
        contractSignatures: {
          include: {
            appUser: true,
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
      const { contractSignatures, contractObligations, ...contractData } =
        contract;
      const signatures = contractSignatures.map(
        signature => signature.appUser,
      ) as AppUser[];
      const obligations = contractObligations
        .map(co => co.obligation)
        .filter(obligation => obligation !== null) as Obligation[];

      const formattedContract = formatContract(contractData, session.user.userId);
      const formattedObligations = formatObligations(obligations);

      const clientContract: ClientContract.default = {
        ...formattedContract,
        obligations: formattedObligations,
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
