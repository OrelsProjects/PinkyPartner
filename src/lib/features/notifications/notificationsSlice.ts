import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Contract from "../../../models/contract";
import Obligation from "../../../models/obligation";

export type NotificationData = {
  title: string;
  body?: string;
  image?: string;
  onClick?: () => void;
};

type ObligationNotification = {
  userId: string;
  contract: Contract;
  obligation: Obligation;
};

export interface NotificationsState {
  status?: "idle" | "loading" | "succeeded" | "failed";
  obligationNotifications: ObligationNotification[];
  didShowContractNotification: boolean;
}

export const initialState: NotificationsState = {
  status: "idle",
  obligationNotifications: [],
  didShowContractNotification: false,
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addObligationNotification(
      state,
      action: PayloadAction<ObligationNotification>,
    ) {
      state.obligationNotifications.push(action.payload);
    },
    removeObligationNotification(
      state,
      action: PayloadAction<ObligationNotification>,
    ) {
      state.obligationNotifications = state.obligationNotifications.filter(
        notification =>
          notification.userId !== action.payload.userId ||
          notification.contract !== action.payload.contract ||
          notification.obligation !== action.payload.obligation,
      );
    },
    setShownContractNotification(state, action: PayloadAction<boolean>) {
      state.didShowContractNotification = action.payload;
    },
    clearObligationNotifications(state) {
      state.obligationNotifications = [];
    },
    setStatus(
      state,
      action: PayloadAction<"idle" | "loading" | "succeeded" | "failed">,
    ) {
      state.status = action.payload;
    },
  },
});

export const {
  setStatus,
  addObligationNotification,
  removeObligationNotification,
  setShownContractNotification,
  clearObligationNotifications,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
