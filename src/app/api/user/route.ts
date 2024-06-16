import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../../authOptions";
import AppUser from "../../../models/appUser";
import prisma from "../_db/db";
import Logger from "../../../loggerServer";

export async function GET(req: NextRequest): Promise<any> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest): Promise<any> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let user: AppUser | null = null;
  try {
    const { user: sessionUser } = session;
    const body = await req.json();
    user = body as AppUser;
    user.email = sessionUser?.email || user.email;
    user.photoURL = sessionUser?.image || user.photoURL;
  } catch (error: any) {
    Logger.error("Error initializing logger", user?.userId || "unknown", {
      error,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest): Promise<any> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    if (!session.user?.userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    await prisma.appUser.delete({
      where: { userId: session.user?.userId },
    });
    return NextResponse.json({}, { status: 200 });
  } catch (error: any) {
    Logger.error("Error deleting user", session.user.userId, { error });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest): Promise<any> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let user: AppUser | null = null;
  try {
    if (!session.user?.userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const { pushToken, pushTokenMobile, displayName } = await req.json();

    if (pushToken) {
      await prisma.appUserMetadata.upsert({
        where: { userId: session.user?.userId },
        update: { pushToken },
        create: { userId: session.user?.userId, pushToken },
      });
    } else if (pushTokenMobile) {
      await prisma.appUserMetadata.upsert({
        where: { userId: session.user?.userId },
        update: { pushTokenMobile },
        create: { userId: session.user?.userId, pushTokenMobile },
      });
    }

    if (displayName) {
      await prisma.appUser.update({
        where: { userId: session.user?.userId },
        data: { displayName },
      });
    }

    return NextResponse.json({}, { status: 200 });
  } catch (error: any) {
    Logger.error("Error updating user", user || "unknown", {
      error,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
