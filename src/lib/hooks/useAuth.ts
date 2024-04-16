/* eslint-disable react-hooks/exhaustive-deps */
import { signIn, signOut as signOutAuth } from "next-auth/react";
import { useCallback } from "react";
import { clearUser, setError } from "../features/auth/authSlice";
import { useAppDispatch } from "./redux";
import { EventTracker } from "../../eventTracker";
import { Logger } from "../../logger";

const useAuth = () => {
  const dispatch = useAppDispatch();

  const signInWithGoogle = useCallback(async () => {
    try {
      await signIn("google");
    } catch (error: any) {
      if (error?.name === "UserAlreadyAuthenticatedException") {
        EventTracker.track("User already authenticated");
        await signOut();
        return;
      }
      Logger.error("Error signing in with Google", { error });
      dispatch(setError("Failed to sign in"));
      console.error(error);
    }
    return null;
  }, []);

  const signOut = useCallback(async () => {
    try {
      EventTracker.track("User signed out");
      await signOutAuth();
      dispatch(clearUser());
      localStorage.clear();
    } catch (error: any) {
      Logger.error("Error signing out", { error });
      dispatch(setError("Failed to sign out"));
    }
  }, []);

  return {
    signInWithGoogle,
    signOut,
  };
};

export default useAuth;
