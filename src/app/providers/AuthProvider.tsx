/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import {
  selectAuth,
  setUser as setUserAction,
} from "../../lib/features/auth/authSlice";
import { usePathname, useRouter } from "next/navigation";
import Loading from "@/components/ui/loading";
import { setUserEventTracker } from "../../eventTracker";
import { setUserLogger } from "../../logger";
import { useSession } from "next-auth/react";
import axios from "axios";
import AppUser from "../../models/appUser";
import { useAppDispatch } from "../../lib/hooks/redux";
import { ThemeProvider } from "./ThemeProvider";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { loading: loadingAuth, user } = useSelector(selectAuth);
  const { data: session, status } = useSession();

  const setUser = async (user?: AppUser) => {
    try {
      let appUser: AppUser | undefined;
      if (user) {
        const response = await axios.post<AppUser>("/api/user/confirm", user);
        appUser = response.data;
      }
      dispatch(setUserAction(appUser));
    } catch (error: any) {
      console.error(error);
      dispatch(setUserAction(null));
    }
  };

  useEffect(() => {
    switch (status) {
      case "authenticated":
        setUser(session.user);
        break;
      case "loading":
        break;
      case "unauthenticated":
        setUser(undefined);
        break;
      default:
        break;
    }
  }, [status]);

  useEffect(() => {
    setUserEventTracker(user);
    setUserLogger(user);
  }, [user]);

  useEffect(() => {
    if (loadingAuth) return;
    if (status === "authenticated") {
      if (
        pathname.includes("login") ||
        pathname.includes("register") ||
        pathname === "/" ||
        pathname === "/home"
      ) {
        router.push("/home");
      }
    } else {
      if (!pathname.includes("login") && !pathname.includes("register")) {
        router.push("/");
      }
    }
  }, [status, loadingAuth]);
  if (loadingAuth) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <Loading className="w-20 h-20" />
      </div>
    );
  }
  return <ThemeProvider>{children}</ThemeProvider>;
}
