// contractsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store"; // Adjust the import path as necessary
import { ContractWithExtras } from "../../models/contract";
import { AccountabilityPartner } from "../../models/appUser";

interface ContractsState {
  contracts: ContractWithExtras[];
  loading: boolean;
  loadingData: boolean;
  error: string | null;
}

const initialState: ContractsState = {
  contracts: [],
  loading: false,
  loadingData: false,
  error: null,
};

const contractsSlice = createSlice({
  name: "contracts",
  initialState,
  reducers: {
    setContracts(state, action: PayloadAction<ContractWithExtras[]>) {
      state.contracts = action.payload;
    },
    addContract(state, action: PayloadAction<ContractWithExtras>) {
      state.contracts = [action.payload, ...state.contracts];
    },
    replaceTempContract(state, action: PayloadAction<ContractWithExtras>) {
      const newContracts = [...state.contracts];
      const index = state.contracts.findIndex(
        contract => contract.contractId === "temp",
      );
      if (index !== -1) {
        // clear the temp contract
        newContracts[index] = {
          ...newContracts[index],
          contractId: action.payload.contractId,
          obligations: action.payload.obligations,
        };
        state.contracts = newContracts;
      }
    },
    updateContract(state, action: PayloadAction<ContractWithExtras>) {
      const index = state.contracts.findIndex(
        contract => contract.contractId === action.payload.contractId,
      );
      if (index !== -1) {
        state.contracts[index] = action.payload;
      }
    },
    updatedManyContracts(state, action: PayloadAction<ContractWithExtras[]>) {
      action.payload.forEach(contract => {
        const index = state.contracts.findIndex(
          c => c.contractId === contract.contractId,
        );
        if (index !== -1) {
          state.contracts[index] = contract;
        }
      });
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
    setLoadingData(state, action: PayloadAction<boolean>) {
      state.loadingData = action.payload;
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
  replaceTempContract,
  updatedManyContracts,
  signContract,
  deleteContract,
  setLoadingData,
  setLoading,
  setError,
} = contractsSlice.actions;

export const selectContracts = (state: RootState) => state.contracts;

export default contractsSlice.reducer;
