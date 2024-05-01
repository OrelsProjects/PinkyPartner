import { getServerSession } from "next-auth";
import Logger from "@/loggerServer";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../../authOptions";
import AppUser from "../../../models/appUser";
import prisma from "../_db/db";

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
    await prisma.appUser.delete({
      where: { userId: session.user.userId },
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
    const { token } = await req.json();
    await prisma.appUserMetadata.upsert({
      where: { userId: session.user.userId },
      update: { pushToken: token },
      create: { userId: session.user.userId, pushToken: token },
    });
    return NextResponse.json({}, { status: 200 });
  } catch (error: any) {
    Logger.error("Error updating user", user || "unknown", {
      error,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
