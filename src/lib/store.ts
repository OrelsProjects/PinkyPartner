import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import contractReducer from "./features/contracts/contractsSlice";
import obligationReducer from "./features/obligations/obligationsSlice";
import notificationsReducer from "./features/notifications/notificationsSlice";
import statusReducer from "./features/status/statusSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      contracts: contractReducer,
      obligations: obligationReducer,
      notifications: notificationsReducer,
      status: statusReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;

export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
