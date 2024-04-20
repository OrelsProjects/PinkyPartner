// contractsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../store'; // Adjust the import path as necessary
import { UserContractData } from '../../../models/userContract';

interface ContractsState {
  contracts: UserContractData[];
  loading: boolean;
  error: string | null;
}

const initialState: ContractsState = {
  contracts: [],
  loading: false,
  error: null,
};

const contractsSlice = createSlice({
  name: 'contracts',
  initialState,
  reducers: {
    setContracts(state, action: PayloadAction<UserContractData[]>) {
      state.contracts = action.payload;
    },
    addContract(state, action: PayloadAction<UserContractData>) {
      state.contracts.push(action.payload);
    },
    updateContract(state, action: PayloadAction<UserContractData>) {
      const index = state.contracts.findIndex(contract => contract.contractId === action.payload.contractId);
      if (index !== -1) {
        state.contracts[index] = action.payload;
      }
    },
    deleteContract(state, action: PayloadAction<string>) {
      state.contracts = state.contracts.filter(contract => contract.contractId !== action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    // Reducers for managing obligations within contracts might also be needed
  },
});

export const {
  setContracts,
  addContract,
  updateContract,
  deleteContract,
  setLoading,
  setError,
} = contractsSlice.actions;

export const selectContracts = (state: RootState) => state.contracts;

export default contractsSlice.reducer;
