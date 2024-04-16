import { getServerSession } from "next-auth";
import Logger from "@/loggerServer";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "../../_db/db";
import { AppUser } from "@prisma/client";

export async function POST(req: NextRequest): Promise<AppUser | any> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let user: {
    name: string | null;
    email: string | null;
    photoURL: string | null;
  } | null = null;
  try {
    const { user: sessionUser } = session;
    const body = await req.json();
    user = body as {
      name: string | null;
      email: string | null;
      photoURL: string | null;
    };
    const existingUser = await prisma.appUser.findUnique({
      where: { email: session.user?.email || user.email || undefined },
    });
    if (existingUser) {
      return NextResponse.json({ ...existingUser }, { status: 200 });
    }

    const appUser = await prisma.appUser.create({
      data: {
        email: sessionUser?.email || user.email || "",
        photoURL: sessionUser?.image || user.photoURL,
        displayName: sessionUser?.name || user.name,
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
