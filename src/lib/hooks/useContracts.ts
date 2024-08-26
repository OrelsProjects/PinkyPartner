import axios from "axios";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import {
  ContractWithExtras,
  CreateContract,
  UpdateContract,
} from "@/models/contract";
import { setError } from "../features/auth/authSlice";
import {
  setContracts as setContractsAction,
  addContract as addContractAction,
  updateContract as updateContractAction,
  deleteContract as deleteContractAction,
  signContract as signContractAction,
  setLoadingData as setLoadingDataAction,
  setLoading,
  replaceTempContract,
} from "../features/contracts/contractsSlice";
import { AccountabilityPartner } from "@/models/appUser";
import { Logger } from "@/logger";
import { useObligations } from "./useObligations";
import { ContractExistsForUserError } from "@/models/errors/ContractExistsForUserError";

export function useContracts() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { fetchNextUpObligations } = useObligations();
  const { contracts, error, loading, loadingData } = useAppSelector(
    state => state.contracts,
  );

  const fetchContracts = async () => {
    dispatch(setLoading(true));
    try {
      if (!user) {
        throw new Error("Accountability partner is required");
      }
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
    if (!contractData.obligations) {
      throw new Error("Obligation is required");
    }
    const optimisticUpdate = () => {
      const obligationsWithTempId = contractData.obligations?.map(
        obligation => ({
          ...obligation,
          obligationId: "temp",
        }),
      );
      const newContract: ContractWithExtras = {
        contractId: "temp",
        title: contractData.title,
        description: contractData.description,
        dueDate: contractData.dueDate,
        createdAt: new Date(),
        contractees: contractData.contractees,
        signatures: [user as AccountabilityPartner],
        obligations: obligationsWithTempId || [],
      };
      dispatch(addContractAction(newContract));
    };

    dispatch(setLoading(true));
    optimisticUpdate();

    try {
      const response = await axios.post<ContractWithExtras>(
        "/api/contract",
        contractData,
      );
      dispatch(replaceTempContract(response.data));
      await fetchNextUpObligations();
      dispatch(setError(null));
      const otherUser = contractData.contractees.find(
        contractee => contractee.userId !== user?.userId,
      );

      axios
        .post("/api/notifications", {
          title: "Put your pinky in!",
          body: `${user?.displayName || "A partner"} sent you a new contract!`,
          userId: otherUser?.userId,
        })
        .catch(err => {
          Logger.error("Error sending notification", err);
        });
    } catch (err: any) {
      dispatch(setError(err.message || "Error creating contract"));
      throw err;
    } finally {
      dispatch(deleteContractAction("temp"));
      dispatch(setLoading(false));
    }
  };

  const setLoadingData = (loading: boolean = true) => {
    dispatch(setLoadingDataAction(loading));
  };

  const setContracts = (contracts: ContractWithExtras[]) => {
    dispatch(setContractsAction(contracts));
  };

  // const updateContract = async (contractData: Contract) => {
  //   dispatch(setLoading(true));
  //   try {
  //     const response = await axios.patch<Contract>(
  //       `/api/contract/${contractData.contractId}`,
  //       contractData,
  //     );
  //     dispatch(updateContractAction(response.data));
  //     dispatch(setError(null));
  //   } catch (err: any) {
  //     dispatch(setError(err.message || "Error updating contract"));
  //     throw err;
  //   } finally {
  //     dispatch(setLoading(false));
  //   }
  // };

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

  const joinContract = async (contractId: string) => {
    dispatch(setLoading(true));
    try {
      if (!user) {
        throw new Error(
          "Cannot join contract without an accountability partner",
        );
      }
      await axios.post(`/api/contract/${contractId}/join`);
      const newContract = await axios.get<ContractWithExtras>(
        `/api/contract/${contractId}`,
      );
      dispatch(addContractAction(newContract.data));
      dispatch(signContractAction({ contractId, user }));
      dispatch(setError(null));
      await fetchNextUpObligations();
    } catch (err: any) {
      // if code is 409, throw ContractExistsForUserError
      if (err.response?.status === 409) {
        throw new ContractExistsForUserError();
      }
      dispatch(setError(err.message || "Error signing contract"));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const signContract = async (contractId: string) => {
    dispatch(setLoading(true));
    try {
      if (!user) {
        throw new Error("Accountability partner is required");
      }
      await axios.post(`/api/contract/${contractId}/sign`);
      const contract = contracts.find(
        contract => contract.contractId === contractId,
      );

      const otherUser = contract?.signatures.find(
        signedContractee => signedContractee.userId !== user?.userId,
      );

      dispatch(signContractAction({ contractId, user }));
      dispatch(setError(null));
      if (otherUser) {
        axios
          .post("/api/notifications", {
            title: "A pinky was sealed!",
            body: `${user.displayName} has signed ${contract?.title || "a contract"}.`,
            userId: otherUser.userId,
          })
          .catch(err => {
            Logger.error("Error sending notification", err);
          });
      }
      await fetchNextUpObligations();
    } catch (err: any) {
      dispatch(setError(err.message || "Error signing contract"));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const updateContract = async (
    contract: ContractWithExtras,
    values: UpdateContract,
  ) => {
    dispatch(setLoading(true));
    try {
      const response = await axios.patch(
        `/api/contract/${contract.contractId}`,
        values,
      );
      const newContract = { ...contract, ...values };
      dispatch(updateContractAction(newContract));
      dispatch(setError(null));
    } catch (err: any) {
      dispatch(setError(err.message || "Error updating contract"));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const optOut = async (contractId: string) => {
    dispatch(setLoading(true));
    try {
      const contract = contracts.find(
        contract => contract.contractId === contractId,
      );
      const otherUser = contract?.signatures.find(
        signedContractee => signedContractee.userId !== user?.userId,
      );

      const result = await axios.post<{ newOwner: string | undefined }>(
        `/api/contract/${contractId}/opt-out`,
      );

      const { newOwner } = result.data;
      if (newOwner) {
        try {
          await axios.post("/api/notifications", {
            title: "A pinky was broken!",
            body: `${user?.displayName} has left ${contract?.title}.`,
            userId: newOwner,
          });
        } catch (err: any) {
          Logger.error("Error sending notification on opt out", err);
        }
      }

      dispatch(deleteContractAction(contractId));
      dispatch(setError(null));
      await fetchNextUpObligations();

      if (otherUser) {
        axios
          .post(`/api/notifications`, {
            title: `${user?.displayName?.split(" ")?.[0]} left. 😢`,
            body: `${user?.displayName} has left ${contract?.title}.`,
            userId: otherUser?.userId,
          })
          .catch(err => {
            Logger.error("Error sending notification", err);
          });
      }
    } catch (err: any) {
      dispatch(setError(err.message || "Error signing contract"));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    error,
    optOut,
    loading,
    contracts,
    loadingData,
    joinContract,
    setContracts,
    signContract,
    fetchContracts,
    setLoadingData,
    createContract,
    updateContract,
    deleteContract,
  };
}
