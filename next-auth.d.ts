import { DefaultSession } from "next-auth";
import {} from "./src/models/appUser";

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
