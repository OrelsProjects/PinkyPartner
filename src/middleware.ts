import { ReferralOptions } from "global";
import { NextRequest, NextResponse } from "next/server";
import loggerServer from "./loggerServer";

const getReferralOptions = (req: NextRequest): ReferralOptions => {
  const { searchParams } = req.nextUrl;

  const referralCode = searchParams.get("referralCode");
  const contractId = searchParams.get("contractId");

  return {
    referralCode,
    contractId,
  };
};

export async function middleware(req: NextRequest) {
  await registerMiddleware(req);

  return NextResponse.next();
}

async function registerMiddleware(req: NextRequest) {
  const { referralCode, contractId } = getReferralOptions(req);

  if (referralCode || contractId) {
    const response = NextResponse.next();

    // expire in 1 week
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    if (referralCode) {
      response.cookies.set("referralCode", referralCode, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        expires: nextWeek,
      });
    }
    if (contractId) {
      response.cookies.set("contractId", contractId, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        expires: nextWeek,
      });
    }
  }
}

// match /register path and if it has params, also match
export const config = {
  matcher: "/register/:path*", // Matches /register and any subpaths
};

export { default } from "next-auth/middleware";
