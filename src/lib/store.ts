import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import contractReducer from "./features/contracts/contractsSlice";
import obligationReducer from "./features/obligations/obligationsSlice";
import notificationsReducer from "./features/notifications/notificationsSlice";
import statusReducer from "./features/status/statusSlice";
// import storage from "redux-persist/lib/storage";

// import { persistReducer, persistStore } from "redux-persist";
// import { PersistPartial } from "redux-persist/es/persistReducer";

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
// const buildReducer = (key: string, reducer: any) =>
//   persistReducer(
//     {
//       key,
//       storage,
//     },
//     reducer,
//   );

// const store = configureStore({
//   reducer: {
//     auth: buildReducer("auth", authReducer),
//     contracts: buildReducer("contracts", contractReducer),
//     obligations: buildReducer("obligations", obligationReducer),
//     notifications: buildReducer("notifications", notificationsReducer),
//     status: buildReducer("status", statusReducer),
//   },
// });

// export const persistor = persistStore(store);

// export const makeStore = () => store;

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
// export type RootState = {
//   auth: ReturnType<typeof authReducer> & PersistPartial;
//   contracts: ReturnType<typeof contractReducer> & PersistPartial;
//   obligations: ReturnType<typeof obligationReducer> & PersistPartial;
//   notifications: ReturnType<typeof notificationsReducer> & PersistPartial;
//   status: ReturnType<typeof statusReducer> & PersistPartial;
// };

export type AppDispatch = AppStore["dispatch"];
