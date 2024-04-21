import { getServerSession } from "next-auth";
import Logger from "@/loggerServer";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../../authOptions";
import AppUser from "../../../models/appUser";

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
