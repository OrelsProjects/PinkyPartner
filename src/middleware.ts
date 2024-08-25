import { ReferralOptions } from "global";
import { NextRequest, NextResponse } from "next/server";

const getReferralOptions = (req: NextRequest): ReferralOptions => {
  const { searchParams } = req.nextUrl;
  const referralCode = searchParams.get("referralCode");
  const contractId = searchParams.get("contractId");
  const challengeId = searchParams.get("challengeId");

  return {
    referralCode,
    contractId,
    challengeId,
  };
};

export async function middleware(req: NextRequest) {
  const response = await registerMiddleware(req);
  return response;
}

async function registerMiddleware(req: NextRequest) {
  const { referralCode, contractId, challengeId } = getReferralOptions(req);

  const response = NextResponse.next();
  if (referralCode || contractId || challengeId) {
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
    if (challengeId) {
      response.cookies.set("challengeId", challengeId, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        expires: nextWeek,
      });
    }
  }
  return response;
}

export const config = {
  matcher: ["/register/:path*", "/login/:path*"],
};

export { default } from "next-auth/middleware";
