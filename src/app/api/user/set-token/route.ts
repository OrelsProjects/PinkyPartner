import { AppUser } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../../../authOptions";
import prisma from "../../_db/db";
import loggerServer from "@/loggerServer";


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
    const { token } = await req.json();
    await prisma.appUserMetadata.upsert({
      where: { userId: session.user?.userId },
      update: { pushToken: token },
      create: { userId: session.user?.userId, pushToken: token },
    });
    return NextResponse.json({}, { status: 200 });
  } catch (error: any) {
    loggerServer.error("Error updating user", user || "unknown", {
      error,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
