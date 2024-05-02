/* eslint-disable react-hooks/exhaustive-deps */
import { signIn, signOut as signOutAuth } from "next-auth/react";
import { useCallback } from "react";
import {
  clearUser,
  setError,
  setDataFetched as setDataFetchedAction,
} from "../features/auth/authSlice";
import { useAppDispatch } from "./redux";
import { EventTracker } from "../../eventTracker";
import { Logger } from "../../logger";
import axios from "axios";

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
      throw error;
    }
  }, []);

  const signInWithApple = useCallback(async () => {
    try {
      await signIn("apple");
    } catch (error: any) {
      if (error?.name === "UserAlreadyAuthenticatedException") {
        EventTracker.track("User already authenticated");
        await signOut();
        return;
      }
      Logger.error("Error signing in with Apple", { error });
      dispatch(setError("Failed to sign in"));
      throw error;
    }
  }, []);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      try {
        const result = await signIn("credentials", {
          email,
          password,
          isSignIn: true,
          redirect: false,
        });
        if (!result?.ok) {
          throw new Error("Failed to sign in");
        }
      } catch (error: any) {
        Logger.error("Error signing in with email", { error });
        dispatch(setError("Failed to sign in"));
        throw error;
      }
    },
    [],
  );

  const signUpWithEmail = useCallback(
    async (
      email: string,
      password: string,
      register?: boolean,
      displayName: string = "",
    ) => {
      try {
        const result = await signIn("credentials", {
          email,
          password,
          displayName: displayName,
          isSignIn: !register,
          redirect: false,
        });
        if (!result?.ok) {
          throw new Error("Failed to sign in");
        }
      } catch (error: any) {
        Logger.error("Error signing in with email", { error });
        dispatch(setError("Failed to sign in"));
        throw error;
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    try {
      EventTracker.track("User signed out");
      await signOutAuth();
      dispatch(clearUser());
      localStorage.clear();
    } catch (error: any) {
      Logger.error("Error signing out", { error });
      dispatch(setError("Failed to sign out"));
      throw error;
    }
  }, []);

  const deleteUser = useCallback(async () => {
    try {
      EventTracker.track("User deleted");
      await axios.delete("/api/user");
      await signOutAuth();
      dispatch(clearUser());
      localStorage.clear();
    } catch (error: any) {
      Logger.error("Error deleting user", { error });
      dispatch(setError("Failed to delete user"));
      throw error;
    }
  }, []);

  const setDataFetched = useCallback(() => {
    dispatch(setDataFetchedAction());
  }, []);

  return {
    signInWithGoogle,
    signInWithApple,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    deleteUser,
    setDataFetched,
  };
};

export default useAuth;
