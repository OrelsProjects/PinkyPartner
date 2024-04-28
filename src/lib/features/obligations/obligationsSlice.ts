// obligationsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store"; // Adjust the import path as necessary
import Obligation, {
  ObligationsInContract,
  ObligationsInContracts,
} from "../../../models/obligation";

interface ObligationsState {
  obligations: Obligation[];
  obligationsToComplete: ObligationsInContracts;
  loading: boolean;
  error: string | null;
}

const initialState: ObligationsState = {
  obligations: [],
  obligationsToComplete: [],
  loading: false,
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
    addObligationsToComplete(
      state,
      action: PayloadAction<ObligationsInContracts>,
    ) {
      state.obligationsToComplete.push(...action.payload);
    },
    completeObligation(state, action: PayloadAction<{ obligationId: string }>) {
      state.obligationsToComplete = state.obligationsToComplete.map(
        (obligationsInContract: ObligationsInContract) => {
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
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
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
  addObligationsToComplete,
  completeObligation,
  setLoading,
  setError,
} = obligationsSlice.actions;

export const selectObligations = (state: RootState) => state.obligations;

export default obligationsSlice.reducer;
