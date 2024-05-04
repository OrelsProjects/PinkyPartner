import axios from "axios";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import Obligation, { CreateObligation } from "../../models/obligation";
import { setError } from "../features/auth/authSlice";
import {
  setObligations as setObligationsAction,
  addObligation as createObligationAction,
  updateObligation as updateObligationAction,
  deleteObligation as deleteObligationAction,
  completeObligation as completeObligationAction,
  setPartnerData as setPartnerDataAction,
  setLoadingData as setLoadingDataAction,
  setLoadingPartnerData as setLoadingPartnerDataAction,
  setContractObligations as setContractObligationsAction,
  setLoading,
} from "../features/obligations/obligationsSlice";
import LoadingError from "../../models/errors/LoadingError";
import Contract, { ContractWithExtras } from "../../models/contract";
import { Logger } from "../../logger";
import UserContractObligation, {
  GetNextUpObligationsResponse,
  UserContractObligationData,
} from "../../models/userContractObligation";

export function useObligations() {
  const dispatch = useAppDispatch();
  const { obligations, error, partnerData, loading, loadingData } =
    useAppSelector(state => state.obligations);
  const { contracts } = useAppSelector(state => state.contracts);
  const { user } = useAppSelector(state => state.auth);

  const updateObligationRepeat = (
    obligation: CreateObligation,
  ): CreateObligation => {
    if (obligation.repeat === "Daily") {
      obligation.timesAWeek = null;
    } else {
      obligation.days = [];
    }
    return obligation;
  };

  const getUserObligation = (obligationId: string) => {
    return obligations.find(
      obligation => obligation.obligationId === obligationId,
    );
  };

  const setLoadingData = (loading: boolean = true) => {
    dispatch(setLoadingDataAction(loading));
  };

  const setLoadingPartnerData = (loading: boolean = true) => {
    dispatch(setLoadingPartnerDataAction(loading));
  };

  const setObligations = (obligations: Obligation[]) => {
    dispatch(setObligationsAction(obligations));
  };

  const createObligation = async (obligationData: CreateObligation) => {
    if (loading) {
      throw new LoadingError("Already deleting obligation");
    }
    dispatch(setLoading(true));
    try {
      const updatedObligation = updateObligationRepeat(obligationData);
      const response = await axios.post("/api/obligation", {
        ...updatedObligation,
        userId: user?.userId,
      });
      dispatch(createObligationAction(response.data.result));
      dispatch(setError(null));
    } catch (err: any) {
      dispatch(setError(err.message || "Error creating obligation"));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const updateObligation = async (obligationData: Obligation) => {
    if (loading) {
      throw new LoadingError("Already deleting obligation");
    }
    dispatch(setLoading(true));
    try {
      const updatedObligation = updateObligationRepeat(obligationData);
      const response = await axios.patch("/api/obligation", updatedObligation);
      dispatch(updateObligationAction(response.data.result));
      dispatch(setError(null));
    } catch (err: any) {
      dispatch(setError(err.message || "Error updating obligation"));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const deleteObligation = async (obligation: Obligation) => {
    if (loading) {
      throw new LoadingError("Already deleting obligation");
    }
    dispatch(setLoading(true));

    try {
      await axios.delete(
        `/api/obligation?obligationId=${obligation.obligationId}`,
      );
      dispatch(deleteObligationAction(obligation.obligationId));
      dispatch(setError(null));
    } catch (err: any) {
      dispatch(setError(err.message || "Error deleting obligation"));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const setUserContractObligations = (
    obligations: UserContractObligationData[],
  ) => {
    dispatch(setContractObligationsAction([...obligations]));
  };

  const setPartnerData = (
    contractObligations: UserContractObligationData[],
  ) => {
    dispatch(
      setPartnerDataAction({
        contractObligations,
      }),
    );
  };

  const sendCompletedObligationNotification = async (
    contract: ContractWithExtras,
    obligation: Obligation,
  ) => {
    try {
      const otherUser = contract.contractees.find(
        contractee => contractee.userId !== user?.userId,
      );
      if (!otherUser) return;

      await axios.post("/api/notifications", {
        title: `${otherUser.displayName || "Your partner"} is progressing!`,
        body: `${obligation.title} completed!`,
        userId: otherUser.userId,
      });
    } catch (error: any) {
      Logger.error("Error sending notification", error);
      throw error;
    }
  };

  const fetchNextUpObligations = async () => {
    try {
      setLoadingData(true);
      const response = await axios.get<GetNextUpObligationsResponse>(
        "/api/obligations/next-up",
      );
      const { userContractObligations, partnerContractObligations } =
        response.data;
      setUserContractObligations(userContractObligations);
      setPartnerData(partnerContractObligations);
    } catch (error: any) {
      Logger.error("Failed to fetch next up obligations", error);
    } finally {
      setLoadingData(false);
    }
  };

  const completeObligation = async (
    obligation: UserContractObligation,
    contractId: string,
  ) => {
    if (loading) {
      throw new LoadingError("Already completing obligation");
    }
    const contract = contracts.find(
      contract => contract.contractId === contractId,
    );

    if (!contract) {
      throw new Error("Contract not found");
    }

    try {
      const obligationCompletedResponse =
        await axios.post<UserContractObligationData>(
          `/api/obligation/${contract.contractId}/${obligation.userContractObligationId}/complete`,
        );
      dispatch(completeObligationAction(obligationCompletedResponse.data));
      dispatch(setError(null));
      // sendCompletedObligationNotification(contract, obligation)
      //   .then(() => {
      //     Logger.info("Notification sent");
      //   })
      //   .catch(err => {
      //     Logger.error("Failed to send notification", err);
      //   });
    } catch (err: any) {
      dispatch(setError(err.message || "Error completing obligation"));
      throw err;
    } finally {
    }
  };

  return {
    obligations,
    partnerData,
    loading,
    loadingData,
    loadingPartner: partnerData.loading,
    error,
    setObligations,
    setLoadingData,
    setLoadingPartnerData,
    getUserObligation,
    createObligation,
    updateObligation,
    deleteObligation,
    setPartnerData,
    fetchNextUpObligations,
    completeObligation,
  };
}
