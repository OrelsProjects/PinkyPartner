import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { searchParams, pathname } = req.nextUrl;

  if (searchParams) {
    const referralCode = searchParams.get("referralCode");
    const contractId = searchParams.get("contractId");

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

      return response;
    }
  }
  return NextResponse.next();
}
