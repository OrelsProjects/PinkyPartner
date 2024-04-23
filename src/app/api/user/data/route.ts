import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../_db/db";
import { Logger } from "../../../../logger";
import { authOptions } from "../../../../authOptions";
import { Obligation, UserContract } from "@prisma/client";

type UserContractData = UserContract & {
  obligations: Obligation[];
};

type UserData = {
  contracts: UserContractData[];
  obligations: Obligation[];
};

export async function GET(
  _: NextRequest,
): Promise<NextResponse<UserData | undefined>> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(undefined, { status: 401 });
  }
  try {
    const obligations: Obligation[] = await prisma.obligation.findMany({
      where: {
        userId: session.user.userId,
      },
    });
    const contracts = await prisma.userContract.findMany({
      where: {
        userId: session.user.userId,
      },
      include: {
        contract: {
          include: {
            contractObligation: {
              include: {
                obligation: true,
              },
            },
          },
        },
      },
    });
    const userContractData: UserContractData[] = contracts.map(contract => {
      const contractObligations: Obligation[] =
        contract.contract.contractObligation.map(
          contractObligation => contractObligation.obligation,
        );
      const { contract: _, ...rest }: { contract: any } & UserContract =
        contract;
      return {
        ...rest,
        obligations: contractObligations,
      };
    });

    return NextResponse.json(
      { obligations, contracts: userContractData },
      { status: 200 },
    );
  } catch (error: any) {
    Logger.error(error);
    return NextResponse.json(undefined, { status: 500 });
  }
}
