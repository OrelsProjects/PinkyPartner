import axios from "axios";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import Obligation, {
  CreateObligation,
  ObligationsInContracts,
} from "../../models/obligation";
import { setError } from "../features/auth/authSlice";
import {
  setObligations as setObligationsAction,
  addObligation as createObligationAction,
  updateObligation as updateObligationAction,
  deleteObligation as deleteObligationAction,
  setObligationsToComplete as setObligationsToCompleteAction,
  completeObligation as completeObligationAction,
  setObligationsCompleted as setObligationsCompletedAction,
  setPartnerData as setPartnerDataAction,
  setLoadingData as setLoadingDataAction,
  setLoadingPartnerData as setLoadingPartnerDataAction,
  setLoading,
} from "../features/obligations/obligationsSlice";
import LoadingError from "../../models/errors/LoadingError";
import ObligationCompleted from "../../models/obligationCompleted";
import Contract from "../../models/contract";
import { Logger } from "../../logger";

export function useObligations() {
  const dispatch = useAppDispatch();
  const {
    obligations,
    error,
    obligationsToComplete,
    obligationsCompleted,
    partnerData,
    loading,
    loadingData,
  } = useAppSelector(state => state.obligations);
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

  const setObligationsToComplete = (obligations: ObligationsInContracts) => {
    dispatch(setObligationsToCompleteAction([...obligations]));
  };

  const setObligationsCompleted = (obligations: ObligationCompleted[]) => {
    dispatch(setObligationsCompletedAction([...obligations]));
  };

  const setPartnerData = (
    obligationsInContracts: ObligationsInContracts,
    obligationsCompleted: ObligationCompleted[],
  ) => {
    dispatch(
      setPartnerDataAction({
        obligationsToComplete: obligationsInContracts,
        obligationsCompleted,
      }),
    );
  };

  const sendCompletedObligationNotification = async (
    contract: Contract,
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

  const completeObligation = async (
    obligation: Obligation,
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
      const obligationCompletedResponse = await axios.post<ObligationCompleted>(
        `/api/obligation/${contract.contractId}/${obligation.obligationId}/complete`,
      );
      dispatch(completeObligationAction(obligationCompletedResponse.data));
      dispatch(setError(null));
      sendCompletedObligationNotification(contract, obligation)
        .then(() => {
          Logger.info("Notification sent");
        })
        .catch(err => {
          Logger.error("Failed to send notification", err);
        });
    } catch (err: any) {
      dispatch(setError(err.message || "Error completing obligation"));
      throw err;
    } finally {
    }
  };

  const fetchPartnerData = async (contracts: Contract[]) => {
    setLoadingPartnerData(true);
    const signedContracts = contracts.filter(
      ({ contractees }) => contractees.length > 1,
    );
    const contractIds = signedContracts.map(({ contractId }) => contractId);
    const params = new URLSearchParams();
    params.append("contractIds", contractIds.join(","));
    try {
      const response = await axios.get<{
        toComplete: ObligationsInContracts;
        completed: ObligationCompleted[];
      }>(`/api/obligations/next-up/partner/${contractIds.join(",")}`);

      const { toComplete, completed } = response.data;
      setPartnerData(toComplete, completed);
    } catch (error: any) {
      Logger.error("Failed to fetch partner data", error);
    } finally {
      setLoadingPartnerData(false);
    }
  };

  return {
    obligations,
    obligationsToComplete,
    obligationsCompleted,
    fetchPartnerData,
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
    setObligationsToComplete,
    setObligationsCompleted,
    setPartnerData,
    completeObligation,
  };
}
