import { getServerSession } from "next-auth";
import Logger from "@/loggerServer";
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../_db/db";
import { AppUser } from "@prisma/client";
import { authOptions } from "../../../../authOptions";

export async function POST(req: NextRequest): Promise<AppUser | any> {
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
    });
    if (existingUser) {
      return NextResponse.json({ ...existingUser }, { status: 200 });
    }

    const appUser = await prisma.appUser.create({
      data: {
        userId: sessionUser?.id || user?.userId,
        email: sessionUser?.email || user?.email || "",
        photoURL: sessionUser?.image || user?.photoURL,
        displayName: sessionUser?.name || user?.displayName,
      },
    });
    return NextResponse.json({ ...appUser }, { status: 201 });
  } catch (error: any) {
    Logger.error("Error initializing logger", "unknown", {
      error,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
