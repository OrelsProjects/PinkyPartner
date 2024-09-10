import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import Logger from "@/loggerServer";
import prisma from "@/app/api/_db/db";
import AppUser from "../../../../../../models/appUser";
import { authOptions } from "@/authOptions";

export async function GET(
  req: NextRequest,
  { params }: { params: { query: string; page?: number } },
): Promise<AppUser[] | any> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { query, page } = params;
  const currentUserId = session.user?.userId;
  try {
    const users = await prisma.appUser.findMany({
      where: {
        userId: {
          not: currentUserId,
        },
        displayName: {
          contains: query,
          mode: "insensitive",
        },
      },
      take: 10,
      skip: page ? (page - 1) * 10 : 0,
    });
    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    Logger.error("error searching for users", currentUserId, {
      data: {
        error,
        query,
        page,
      },
    });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
