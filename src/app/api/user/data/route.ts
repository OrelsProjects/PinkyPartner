import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "../../_db/db";
import { UserData } from "../../../../models/appUser";
import { Logger } from "../../../../logger";
import { UserContractData } from "../../../../models/userContract";

export async function GET(
  req: NextRequest,
): Promise<NextResponse<UserData | undefined>> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(undefined, { status: 401 });
  }
  try {
    const userObligations = await prisma.obligation.findMany({
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
    const userContracts: UserContractData[] = contracts.map(contract => {
      return {
        ...contract,
        obligations: contract.contract.contractObligation.map(
          contractObligation => contractObligation.obligation,
        ),
      };
    });
    return NextResponse.json(
      { obligations: userObligations, contracts: userContracts },
      { status: 200 },
    );
  } catch (error: any) {
    Logger.error(error);
    return NextResponse.json(undefined, { status: 500 });
  }
}
