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
  addObligationsToComplete as addObligationsToCompleteAction,
  completeObligation as completeObligationAction,
  setLoading,
} from "../features/obligations/obligationsSlice";
import LoadingError from "../../models/errors/LoadingError";

export function useObligations() {
  const dispatch = useAppDispatch();
  const { obligations, error, obligationsToComplete, loading } = useAppSelector(
    state => state.obligations,
  );
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

  const fetchObligations = async () => {
    if (loading) {
      throw new LoadingError("Already deleting obligation");
    }
    dispatch(setLoading(true));
    try {
      const response = await axios.get("/api/obligation");
      dispatch(setObligationsAction(response.data.result));
      dispatch(setError(null));
    } catch (err: any) {
      dispatch(setError(err.message || "Error fetching obligations"));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const setLoadingData = (loading: boolean = true) => {
    dispatch(setLoading(loading));
  };

  const setObligations = (obligations: Obligation[]) => {
    dispatch(setObligationsAction(obligations));
    dispatch(setLoading(false));
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
      await axios.delete(`/api/obligation/${obligation.obligationId}`);
      dispatch(deleteObligationAction(obligation.obligationId));
      dispatch(setError(null));
    } catch (err: any) {
      dispatch(setError(err.message || "Error deleting obligation"));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const addObligationsToComplete = (obligations: ObligationsInContracts) => {
    dispatch(addObligationsToCompleteAction([...obligations]));
  };

  const completeObligation = async (obligationId: string) => {
    if (loading) {
      throw new LoadingError("Already completing obligation");
    }
    dispatch(setLoading(true));

    try {
      await axios.post(`/api/obligation/${obligationId}/complete`);
      dispatch(
        completeObligationAction({
          obligationId,
        }),
      );
      dispatch(setError(null));
    } catch (err: any) {
      dispatch(setError(err.message || "Error completing obligation"));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    obligations,
    obligationsToComplete,
    loading,
    error,
    setObligations,
    setLoadingData,
    getUserObligation,
    fetchObligations,
    createObligation,
    updateObligation,
    deleteObligation,
    addObligationsToComplete,
    completeObligation,
  };
}
