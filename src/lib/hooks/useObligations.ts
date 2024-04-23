import axios from "axios";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import Obligation, { CreateObligation } from "../../models/obligation";
import { setError } from "../features/auth/authSlice";
import {
  setObligations as setObligationsAction,
  addObligation as createObligationAction,
  updateObligation as updateObligationAction,
  deleteObligation as deleteObligationAction,
} from "../features/obligations/obligationsSlice";
import LoadingError from "../../models/errors/LoadingError";
import { useRef, useState } from "react";

export function useObligations() {
  const dispatch = useAppDispatch();
  const { obligations, error } = useAppSelector(state => state.obligations);
  const { user } = useAppSelector(state => state.auth);
  const [loading, setLoading] = useState(false);

  const updateObligationRepeat = (
    obligation: CreateObligation,
  ): CreateObligation => {
    if (obligation.repeat === "Daily") {
      obligation.timesAWeek = undefined;
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
    setLoading(true);
    try {
      const response = await axios.get("/api/obligation");
      dispatch(setObligationsAction(response.data.result));
      dispatch(setError(null));
    } catch (err: any) {
      dispatch(setError(err.message || "Error fetching obligations"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const setObligations = (obligations: Obligation[]) => {
    dispatch(setObligationsAction(obligations));
  };

  const createObligation = async (obligationData: CreateObligation) => {
    if (loading) {
      throw new LoadingError("Already deleting obligation");
    }
    setLoading(true);
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
      setLoading(false);
    }
  };

  const updateObligation = async (obligationData: Obligation) => {
    if (loading) {
      throw new LoadingError("Already deleting obligation");
    }
    setLoading(true);
    try {
      const updatedObligation = updateObligationRepeat(obligationData);
      const response = await axios.patch("/api/obligation", updatedObligation);
      dispatch(updateObligationAction(response.data.result));
      dispatch(setError(null));
    } catch (err: any) {
      dispatch(setError(err.message || "Error updating obligation"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteObligation = async (obligation: Obligation) => {
    if (loading) {
      throw new LoadingError("Already deleting obligation");
    }
    setLoading(true);

    try {
      await axios.delete(`/api/obligation/${obligation.obligationId}`);
      dispatch(deleteObligationAction(obligation.obligationId));
      dispatch(setError(null));
    } catch (err: any) {
      dispatch(setError(err.message || "Error deleting obligation"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    obligations,
    loading,
    error,
    setObligations,
    getUserObligation,
    fetchObligations,
    createObligation,
    updateObligation,
    deleteObligation,
  };
}
