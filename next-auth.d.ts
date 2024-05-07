import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      userId: string;
      meta: {
        referralCode?: string;
        pushToken?: string;
      };
    } & DefaultSession["user"];
  }
}
