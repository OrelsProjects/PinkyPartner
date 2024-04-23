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
import { useState } from "react";

export function useContracts() {
  const dispatch = useAppDispatch();
  const { contracts, error } = useAppSelector(state => state.contracts);

  const [loading, setLoading] = useState(false);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/contract");
      dispatch(setContractsAction(response.data.result));
      dispatch(setError(null));
    } catch (err: any) {
      dispatch(setError(err.message || "Error fetching contracts"));
    } finally {
      setLoading(false);
    }
  };

  const createContract = async (contractData: CreateContract) => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  const setContracts = (contracts: UserContractData[]) => {
    dispatch(setContractsAction(contracts));
  };

  const updateContract = async (contractData: UserContractData) => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  const deleteContract = async (contractId: string) => {
    setLoading(true);
    try {
      await axios.delete(`/api/contract/${contractId}`);
      dispatch(deleteContractAction(contractId));
      dispatch(setError(null));
    } catch (err: any) {
      dispatch(setError(err.message || "Error deleting contract"));
    } finally {
      setLoading(false);
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
