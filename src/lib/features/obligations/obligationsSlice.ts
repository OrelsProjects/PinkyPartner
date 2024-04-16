// obligationsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../store'; // Adjust the import path as necessary
import ContractObligation from '../../../models/contractObligation';
import Obligation from '../../../models/obligation';

interface ObligationsState {
  obligations: Obligation[];
  contractObligations: ContractObligation[];
  loading: boolean;
  error: string | null;
}

const initialState: ObligationsState = {
  obligations: [],
  contractObligations: [],
  loading: false,
  error: null,
};

const obligationsSlice = createSlice({
  name: 'obligations',
  initialState,
  reducers: {
    setObligations(state, action: PayloadAction<Obligation[]>) {
      state.obligations = action.payload;
    },
    addObligation(state, action: PayloadAction<Obligation>) {
      state.obligations.push(action.payload);
    },
    updateObligation(state, action: PayloadAction<Obligation>) {
      const index = state.obligations.findIndex(obligation => obligation.obligationId === action.payload.obligationId);
      if (index !== -1) {
        state.obligations[index] = action.payload;
      }
    },
    deleteObligation(state, action: PayloadAction<string>) {
      state.obligations = state.obligations.filter(obligation => obligation.obligationId !== action.payload);
    },
    setContractObligations(state, action: PayloadAction<ContractObligation[]>) {
      state.contractObligations = action.payload;
    },
    addContractObligation(state, action: PayloadAction<ContractObligation>) {
      state.contractObligations.push(action.payload);
    },
    updateContractObligation(state, action: PayloadAction<ContractObligation>) {
      const index = state.contractObligations.findIndex(co => co.contractObligationId === action.payload.contractObligationId);
      if (index !== -1) {
        state.contractObligations[index] = action.payload;
      }
    },
    deleteContractObligation(state, action: PayloadAction<string>) {
      state.contractObligations = state.contractObligations.filter(co => co.contractObligationId !== action.payload);
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
  setContractObligations,
  addContractObligation,
  updateContractObligation,
  deleteContractObligation,
  setLoading,
  setError,
} = obligationsSlice.actions;

export const selectObligations = (state: RootState) => state.obligations;

export default obligationsSlice.reducer;
