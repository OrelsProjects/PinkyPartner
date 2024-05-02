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
  setLoadingData as setLoadingDataAction,
  setLoading,
} from "../features/contracts/contractsSlice";
import { AccountabilityPartner } from "../../models/appUser";
import { Logger } from "../../logger";
import { useObligations } from "./useObligations";

export function useContracts() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { fetchPartnerData, fetchNextUpObligations } = useObligations();
  const { contracts, error, loading, loadingData } = useAppSelector(
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
      const otherUser = contractData.contractees.find(
        contractee => contractee.userId !== user?.userId,
      );
      axios
        .post("/api/notifications", {
          title: "Put your pinky in!",
          body: `${otherUser?.displayName} sent you a new contract!`,
          userId: otherUser?.userId,
        })
        .catch(err => {
          Logger.error("Error sending notification", err);
        });
    } catch (err: any) {
      dispatch(setError(err.message || "Error creating contract"));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const setLoadingData = (loading: boolean = true) => {
    dispatch(setLoadingDataAction(loading));
  };

  const setContracts = (contracts: Contract[]) => {
    dispatch(setContractsAction(contracts));
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

      const fetchDataPromises = [
        fetchPartnerData(contracts),
        fetchNextUpObligations(),
      ];
      dispatch(signContractAction({ contractId, user: accountabilityPartner }));
      dispatch(setError(null));
      Promise.allSettled(fetchDataPromises).catch(err => {
        Logger.error("Error fetching data after signing contract", err);
      });
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
    loadingData,
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
