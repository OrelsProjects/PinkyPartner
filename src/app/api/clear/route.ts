import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../../authOptions";
import prisma from "../_db/db";

export async function POST(
  req: NextRequest,
  { params }: { params: { contractId: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(undefined, { status: 401 });
  }
  try {
    //Clear all data from all tables but appUser and appUserMetadata
    await prisma.userContract.deleteMany();
    await prisma.contractObligation.deleteMany();
    await prisma.obligation.deleteMany();
    await prisma.contract.deleteMany();
    await prisma.userContractObligation.deleteMany();

    return NextResponse.json({ message: "Contract signed" }, { status: 200 }); 
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
