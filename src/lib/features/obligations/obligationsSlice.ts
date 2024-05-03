// obligationsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store"; // Adjust the import path as necessary
import Obligation, { ObligationsInContracts } from "../../../models/obligation";
import ObligationCompleted from "../../../models/obligationCompleted";
import UserContractObligation from "../../../models/userContractObligation";

interface ObligationsState {
  obligations: Obligation[];
  contractObligations: UserContractObligation[];
  partnerData: {
    loading?: boolean;
    contractObligations: UserContractObligation[];
  };
  loading: boolean;
  loadingData: boolean;
  error: string | null;
}

const initialState: ObligationsState = {
  obligations: [],
  contractObligations: [],
  partnerData: {
    loading: false,
    contractObligations: [],
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
    setContractObligations(
      state,
      action: PayloadAction<UserContractObligation[]>,
    ) {
      state.contractObligations = action.payload;
    },
    setPartnerData(
      state,
      action: PayloadAction<{
        contractObligations: UserContractObligation[];
      }>,
    ) {
      state.partnerData = action.payload;
    },

    completeObligation(state, action: PayloadAction<UserContractObligation>) {
      state.contractObligations = state.contractObligations.map(
        (obligationsInContract: UserContractObligation) => {
          if (
            obligationsInContract.obligationId !== action.payload.obligationId
          ) {
            return obligationsInContract;
          }
          return {
            ...obligationsInContract,
          };
        },
      );
      state.contractObligations.push(action.payload);
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
  setPartnerData,
  completeObligation,
  setLoading,
  setLoadingData,
  setLoadingPartnerData,
  setContractObligations,
  setError,
} = obligationsSlice.actions;

export const selectObligations = (state: RootState) => state.obligations;

export default obligationsSlice.reducer;
