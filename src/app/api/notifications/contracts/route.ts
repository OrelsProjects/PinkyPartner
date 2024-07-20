import { getServerSession } from "next-auth";
import Logger from "../../../../loggerServer";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../../../authOptions";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
  } catch (error: any) {
    Logger.error("Error sending notification", session.user.userId, {
      data: { error },
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
