import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import _ from "lodash";
import AppUser, {
  AppUserSettings,
  UserPaidStatus,
} from "../../../models/appUser";

export type AuthStateType =
  | "anonymous"
  | "authenticated"
  | "unauthenticated"
  | "registration_required";

export interface AuthState {
  user?: AppUser | null;
  isAdmin: boolean;
  state: AuthStateType;
  isDataFetched?: boolean;
  forceFetch?: boolean;
  loading: boolean;
  error: string | null;
}

export const initialState: AuthState = {
  user: null,
  isAdmin: false,
  state: "unauthenticated",
  loading: true,
  isDataFetched: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<
        | ((AppUser | undefined) & {
            state?: AuthStateType;
            paidStatus?: UserPaidStatus;
          })
        | null
        | undefined
      >,
    ) => {
      state.loading = false;
      if (!action.payload) {
        state.user = null;
        state.state = "unauthenticated";
        return;
      }
      const { state: authState, paidStatus, ...user } = action.payload;
      if (user && !_.isEqual(state.user, user)) {
        state.user = user;
      }
      state.state = action.payload.state ?? "authenticated";
    },
    updateUserSettings: (
      state,
      action: PayloadAction<Partial<AppUserSettings>>,
    ) => {
      if (state.user) {
        state.user = {
          ...state.user,
          settings: {
            ...state.user.settings,
            ...action.payload,
          },
        };
      }
    },
    updateOnboardingCompleted: (state, action: PayloadAction<boolean>) => {
      if (state.user) {
        if (state.user.meta?.onboardingCompleted === action.payload) return;
        const newUser: AppUser = {
          ...state.user,
          meta: {
            ...state.user.meta,
            referralCode: state.user.meta?.referralCode || "",
            onboardingCompleted: action.payload,
          },
        };
        state.user = newUser;
      }
    },
    updateUserDisplayName: (
      state,
      action: PayloadAction<string | undefined>,
    ) => {
      if (state.user) {
        state.user = {
          ...state.user,
          displayName: action.payload,
        };
      }
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearUser: state => {
      state.loading = false;
      state.user = null;
      state.state = "unauthenticated";
    },
    setDataFetched: state => {
      state.isDataFetched = true;
    },
    setForceFetch: (state, action: PayloadAction<boolean>) => {
      state.forceFetch = action.payload;
    },
  },
});

export const {
  setUser,
  setError,
  setForceFetch,
  clearUser,
  setDataFetched,
  updateUserSettings,
  updateUserDisplayName,
  updateOnboardingCompleted,
} = authSlice.actions;

export const selectAuth = (state: RootState): AuthState => state.auth;

export default authSlice.reducer;
