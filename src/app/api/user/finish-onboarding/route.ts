import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/api/_db/db";
import Logger from "@/loggerServer";
import { authOptions } from "@/authOptions";

export async function POST(_: NextRequest): Promise<NextResponse<void>> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(undefined, { status: 200 });
  }

  try {
    await prisma.appUserMetadata.upsert({
      where: {
        userId: session.user.userId,
      },
      update: {
        onboardingCompleted: true,
      },
      create: {
        userId: session.user.userId,
        onboardingCompleted: true,
      },
    });
    return NextResponse.json(undefined, { status: 200 });
  } catch (error: any) {
    Logger.error("Error getting user data", session.user.userId, error);
    return NextResponse.json(undefined, { status: 500 });
  }
}
