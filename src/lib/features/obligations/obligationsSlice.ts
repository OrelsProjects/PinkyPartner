// obligationsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store"; // Adjust the import path as necessary
import Obligation, {
  ContractWithUser,
  ContractsWithUser,
} from "../../../models/obligation";
import ObligationCompleted from "../../../models/obligationCompleted";

interface ObligationsState {
  obligations: Obligation[];
  obligationsToComplete: ContractsWithUser;
  obligationsCompleted: ObligationCompleted[];
  partnerData: {
    loading?: boolean;
    obligationsToComplete: ContractsWithUser;
    obligationsCompleted: ObligationCompleted[];
  };
  loading: boolean;
  loadingData: boolean;
  error: string | null;
}

const initialState: ObligationsState = {
  obligations: [],
  obligationsToComplete: [],
  obligationsCompleted: [],
  partnerData: {
    loading: false,
    obligationsToComplete: [],
    obligationsCompleted: [],
  },
  loading: false,
  loadingData: true,
  error: null,
};

const obligationsSlice = createSlice({
  name: "obligations",
  initialState,
  reducers: {
    setObligations(state, action: PayloadAction<Obligation[]>) {
      state.obligations = action.payload;
    },
    addObligation(state, action: PayloadAction<Obligation>) {
      state.obligations.push(action.payload);
    },
    updateObligation(state, action: PayloadAction<Obligation>) {
      const index = state.obligations.findIndex(
        obligation => obligation.obligationId === action.payload.obligationId,
      );
      if (index !== -1) {
        state.obligations[index] = action.payload;
      }
    },
    deleteObligation(state, action: PayloadAction<string>) {
      state.obligations = state.obligations.filter(
        obligation => obligation.obligationId !== action.payload,
      );
    },
    setObligationsToComplete(
      state,
      action: PayloadAction<ContractsWithUser>,
    ) {
      state.obligationsToComplete = action.payload;
    },
    setObligationsCompleted(
      state,
      action: PayloadAction<ObligationCompleted[]>,
    ) {
      state.obligationsCompleted = action.payload;
    },
    setPartnerData(
      state,
      action: PayloadAction<{
        obligationsToComplete: ContractsWithUser;
        obligationsCompleted: ObligationCompleted[];
      }>,
    ) {
      state.partnerData = action.payload;
    },

    completeObligation(state, action: PayloadAction<ObligationCompleted>) {
      state.obligationsToComplete = state.obligationsToComplete.map(
        (obligationsInContract: ContractWithUser) => {
          const newObligations = obligationsInContract.obligations.filter(
            obligation =>
              obligation.obligationId !== action.payload.obligationId,
          );
          return {
            ...obligationsInContract,
            obligations: newObligations,
          };
        },
      );
      state.obligationsCompleted.push(action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setLoadingData(state, action: PayloadAction<boolean>) {
      state.loadingData = action.payload;
    },
    setLoadingPartnerData(state, action: PayloadAction<boolean>) {
      state.partnerData = {
        ...state.partnerData,
        loading: action.payload,
      };
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const {
  setObligations,
  addObligation,
  updateObligation,
  deleteObligation,
  setObligationsToComplete,
  setObligationsCompleted,
  setPartnerData,
  completeObligation,
  setLoading,
  setLoadingData,
  setLoadingPartnerData,
  setError,
} = obligationsSlice.actions;

export const selectObligations = (state: RootState) => state.obligations;

export default obligationsSlice.reducer;
