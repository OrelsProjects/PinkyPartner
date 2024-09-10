import { getServerSession } from "next-auth";
import Logger from "@/loggerServer";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/api/_db/db";
import { AppUser, AppUserMetadata } from "@prisma/client";
import { authOptions } from "../../../../authOptions";
import { generateReferralCode } from "@/lib/utils/referralUtils";

export async function POST(
  req: NextRequest,
): Promise<(AppUser & { meta: AppUserMetadata }) | any> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let user: AppUser | null = null;
  try {
    const { user: sessionUser } = session;
    user = await req.json();
    const existingUser = await prisma.appUser.findUnique({
      where: { email: session.user?.email || user?.email || undefined },
      include: { meta: true },
    });
    if (existingUser) {
      if (!existingUser.meta) {
        const appUserMetadata = await prisma.appUserMetadata.create({
          data: {
            userId: existingUser.userId,
            referralCode: generateReferralCode(existingUser.userId),
          },
        });
        existingUser.meta = appUserMetadata;
      }
      const { password, ...userNoPassword } = existingUser;
      return NextResponse.json({ ...userNoPassword }, { status: 200 });
    }

    if (!sessionUser?.userId || !user?.userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const appUser = await prisma.appUser.create({
      data: {
        userId: sessionUser.userId || user?.userId,
        email: sessionUser.email || user?.email || "",
        photoURL: sessionUser.image || user?.photoURL,
        displayName: sessionUser.name || user?.displayName,
      },
    });

    const appUserMetadata = await prisma.appUserMetadata.create({
      data: {
        userId: appUser.userId,
        referralCode: generateReferralCode(appUser.userId),
      },
    });

    const { password, ...userNoPassword } = appUser;

    return NextResponse.json(
      { ...userNoPassword, meta: appUserMetadata },
      { status: 201 },
    );
  } catch (error: any) {
    Logger.error("Error initializing logger", "unknown", {
      error,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
