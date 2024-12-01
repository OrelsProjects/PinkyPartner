// obligationsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store"; // Adjust the import path as necessary
import Obligation from "../../models/obligation";
import { UserContractObligationData } from "../../models/userContractObligation";

interface ObligationsState {
  obligations: Obligation[];
  contractObligations: UserContractObligationData[];
  partnerData: {
    loading?: boolean;
    contractObligations: UserContractObligationData[];
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
      action: PayloadAction<UserContractObligationData[]>,
    ) {
      state.contractObligations = action.payload;
    },
    setPartnerData(
      state,
      action: PayloadAction<{
        contractObligations: UserContractObligationData[];
      }>,
    ) {
      state.partnerData = action.payload;
    },
    setViewedAt(
      state,
      action: PayloadAction<{
        userContractObligationId: string;
        viewedAt: Date;
      }>,
    ) {
      state.contractObligations = state.contractObligations.map(
        (obligation: UserContractObligationData) => {
          if (
            obligation.userContractObligationId ===
            action.payload.userContractObligationId
          ) {
            return {
              ...obligation,
              viewedAt: action.payload.viewedAt,
            };
          }
          return obligation;
        },
      );
    },
    completeObligation(
      state,
      action: PayloadAction<UserContractObligationData>,
    ) {
      state.contractObligations = state.contractObligations.map(
        (obligationsInContract: UserContractObligationData) => {
          if (
            obligationsInContract.userContractObligationId !==
            action.payload.userContractObligationId
          ) {
            return obligationsInContract;
          }
          return {
            ...obligationsInContract,
            completedAt: action.payload.completedAt,
          };
        },
      );
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
  setViewedAt,
  completeObligation,
  setLoading,
  setLoadingData,
  setLoadingPartnerData,
  setContractObligations,
  setError,
} = obligationsSlice.actions;

export const selectObligations = (state: RootState) => state.obligations;

export default obligationsSlice.reducer;
