import axios from "axios";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import Contract, { CreateContract } from "../../models/contract";
import { setError } from "../features/auth/authSlice";
import {
  setContracts as setContractsAction,
  addContract as addContractAction,
  updateContract as updateContractAction,
  deleteContract as deleteContractAction,
  setLoading,
} from "../features/contracts/contractsSlice";
import { UserContractData } from "../../models/userContract";

export function useContracts() {
  const dispatch = useAppDispatch();
  const { contracts, loading, error } = useAppSelector(
    state => state.contracts,
  );

  const fetchContracts = async () => {
    dispatch(setLoading(true));
    try {
      const response = await axios.get("/api/contract");
      dispatch(setContractsAction(response.data.result));
      dispatch(setError(null));
    } catch (err: any) {
      dispatch(setError(err.message || "Error fetching contracts"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const createContract = async (contractData: CreateContract) => {
    dispatch(setLoading(true));
    try {
      const response = await axios.post<UserContractData>(
        "/api/contract",
        contractData,
      );
      dispatch(addContractAction(response.data));
      dispatch(setError(null));
    } catch (err: any) {
      dispatch(setError(err.message || "Error creating contract"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const setContracts = (contracts: UserContractData[]) => {
    dispatch(setContractsAction(contracts));
  };

  const updateContract = async (contractData: UserContractData) => {
    dispatch(setLoading(true));
    try {
      const response = await axios.patch<UserContractData>(
        `/api/contract/${contractData.contractId}`,
        contractData,
      );
      dispatch(updateContractAction(response.data));
      dispatch(setError(null));
    } catch (err: any) {
      dispatch(setError(err.message || "Error updating contract"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const deleteContract = async (contractId: string) => {
    dispatch(setLoading(true));
    try {
      await axios.delete(`/api/contract/${contractId}`);
      dispatch(deleteContractAction(contractId));
      dispatch(setError(null));
    } catch (err: any) {
      dispatch(setError(err.message || "Error deleting contract"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    contracts,
    loading,
    error,
    setContracts,
    fetchContracts,
    createContract,
    updateContract,
    deleteContract,
  };
}
