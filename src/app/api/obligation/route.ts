import { NextRequest, NextResponse } from "next/server";
import Logger from "@/loggerServer";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "../_db/db";
import { CreateObligation } from "../../../models/obligation";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = (await req.json()) as any as CreateObligation;
    const obligation = await prisma.obligation.create({
      data: {
        ...data,
        userId: session.user.userId,
      },
    });
    return NextResponse.json({ result: obligation }, { status: 201 });
  } catch (error: any) {
    Logger.error("Error creating obligation", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const obligationId = req.nextUrl.searchParams.get("id") as string;
    const obligation = await prisma.obligation.findUnique({
      where: { obligationId },
    });
    if (!obligation) {
      return NextResponse.json(
        { error: "Obligation not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ result: obligation }, { status: 200 });
  } catch (error: any) {
    Logger.error("Error fetching obligation", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const obligationId = req.nextUrl.searchParams.get("id") as string;
    const data = await req.json();
    const isObligationOwner = await prisma.obligation.findFirst({
      where: {
        obligationId,
        userId: session.user.userId,
      },
    });
    if (!isObligationOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const obligation = await prisma.obligation.update({
      where: { obligationId },
      data,
    });
    return NextResponse.json({ result: obligation }, { status: 200 });
  } catch (error: any) {
    Logger.error("Error updating obligation", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const obligationId = req.nextUrl.searchParams.get("id") as string;
    const isObligationOwner = await prisma.obligation.findFirst({
      where: {
        obligationId,
        userId: session.user.userId,
      },
    });
    if (!isObligationOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await prisma.obligation.delete({
      where: { obligationId },
    });
    return NextResponse.json(
      { message: "Obligation deleted successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    Logger.error("Error deleting obligation", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
