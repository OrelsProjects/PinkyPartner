import axios from "axios";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import Contract, { CreateContract } from "../../models/contract";
import { setError } from "../features/auth/authSlice";
import {
  setContracts as setContractsAction,
  addContract as addContractAction,
  updateContract as updateContractAction,
  deleteContract as deleteContractAction,
  signContract as signContractAction,
  setLoading,
} from "../features/contracts/contractsSlice";
import { AccountabilityPartner } from "../../models/appUser";

export function useContracts() {
  const dispatch = useAppDispatch();
  const { contracts, error, loading } = useAppSelector(
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
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const createContract = async (contractData: CreateContract) => {
    dispatch(setLoading(true));
    try {
      const response = await axios.post<Contract>(
        "/api/contract",
        contractData,
      );
      dispatch(addContractAction(response.data));
      dispatch(setError(null));
    } catch (err: any) {
      dispatch(setError(err.message || "Error creating contract"));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const setLoadingData = (loading: boolean = true) => {
    dispatch(setLoading(loading));
  };

  const setContracts = (contracts: Contract[]) => {
    dispatch(setContractsAction(contracts));
    dispatch(setLoading(false));
  };

  const updateContract = async (contractData: Contract) => {
    dispatch(setLoading(true));
    try {
      const response = await axios.patch<Contract>(
        `/api/contract/${contractData.contractId}`,
        contractData,
      );
      dispatch(updateContractAction(response.data));
      dispatch(setError(null));
    } catch (err: any) {
      dispatch(setError(err.message || "Error updating contract"));
      throw err;
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
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const signContract = async (
    contractId: string,
    accountabilityPartner?: AccountabilityPartner | null,
  ) => {
    dispatch(setLoading(true));
    try {
      if (!accountabilityPartner) {
        throw new Error("Accountability partner is required");
      }
      await axios.post(`/api/contract/${contractId}/sign`);
      dispatch(signContractAction({ contractId, user: accountabilityPartner }));
      dispatch(setError(null));
    } catch (err: any) {
      dispatch(setError(err.message || "Error signing contract"));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    contracts,
    loading,
    error,
    setContracts,
    setLoadingData,
    signContract,
    fetchContracts,
    createContract,
    updateContract,
    deleteContract,
  };
}
