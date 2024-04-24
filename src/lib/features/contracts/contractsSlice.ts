// contractsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store"; // Adjust the import path as necessary
import Contract from "../../../models/contract";
import { AccountabilityPartner } from "../../../models/appUser";

interface ContractsState {
  contracts: Contract[];
  loading: boolean;
  error: string | null;
}

const initialState: ContractsState = {
  contracts: [],
  loading: false,
  error: null,
};

const contractsSlice = createSlice({
  name: "contracts",
  initialState,
  reducers: {
    setContracts(state, action: PayloadAction<Contract[]>) {
      state.contracts = action.payload;
    },
    addContract(state, action: PayloadAction<Contract>) {
      state.contracts.push(action.payload);
    },
    updateContract(state, action: PayloadAction<Contract>) {
      const index = state.contracts.findIndex(
        contract => contract.contractId === action.payload.contractId,
      );
      if (index !== -1) {
        state.contracts[index] = action.payload;
      }
    },
    signContract(
      state,
      action: PayloadAction<{
        contractId: string;
        user: AccountabilityPartner;
      }>,
    ) {
      const contract = state.contracts.find(
        contract => contract.contractId === action.payload.contractId,
      );
      if (contract) {
        contract.signatures.push(action.payload.user);
      }
    },
    deleteContract(state, action: PayloadAction<string>) {
      state.contracts = state.contracts.filter(
        contract => contract.contractId !== action.payload,
      );
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
  signContract,
  deleteContract,
  setLoading,
  setError,
} = contractsSlice.actions;

export const selectContracts = (state: RootState) => state.contracts;

export default contractsSlice.reducer;
