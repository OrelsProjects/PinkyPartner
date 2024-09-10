import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../../authOptions";
import prisma from "@/app/api/_db/db";
import loggerServer from "../../../loggerServer";

export async function POST(
  req: NextRequest,
  { params }: { params: { contractId: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(undefined, { status: 401 });
  }
  try {
    const env = process.env.NODE_ENV;
    if (env !== "development") {
      loggerServer.warn(
        "Clear route called in production",
        session.user?.userId || "unknown",
      );
      return NextResponse.json(
        { error: "Clear route can only be called in development" },
        { status: 400 },
      );
    }

    if (session.user?.userId !== "102926335316336979769") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (process.env.ALLOW_CLEAR !== "true") {
      return NextResponse.json(
        { error: "Clearing is disabled" },
        { status: 400 },
      );
    }

    // Only if route comes from localhost
    if (req.headers.get("host") !== "localhost:3000") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
