import axios from "axios";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import Obligation, { CreateObligation } from "../../models/obligation";
import { setError } from "../features/auth/authSlice";
import { setLoading } from "../features/contracts/contractsSlice";
import {
  setObligations as setObligationsAction,
  addObligation as createObligationAction,
  updateObligation as updateObligationAction,
  deleteObligation as deleteObligationAction,
} from "../features/obligations/obligationsSlice";

export function useObligations() {
  const dispatch = useAppDispatch();
  const { obligations, loading, error } = useAppSelector(
    state => state.obligations,
  );
  const { user } = useAppSelector(state => state.auth);

  const getUserObligation = (obligationId: string) => {
    return obligations.find(
      obligation => obligation.obligationId === obligationId,
    );
  };

  const fetchObligations = async () => {
    if (loading) {
      throw new Error("Already fetching obligations");
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

  const setObligations = (obligations: Obligation[]) => {
    dispatch(setObligationsAction(obligations));
  };

  const createObligation = async (obligationData: CreateObligation) => {
    if (loading) {
      throw new Error("Already creating obligation");
    }

    dispatch(setLoading(true));
    try {
      const response = await axios.post("/api/obligation", {
        ...obligationData,
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
      throw new Error("Already updating obligation");
    }

    dispatch(setLoading(true));
    try {
      const response = await axios.patch("/api/obligation", obligationData);
      dispatch(updateObligationAction(response.data.result));
      dispatch(setError(null));
    } catch (err: any) {
      dispatch(setError(err.message || "Error updating obligation"));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const deleteObligation = async (obligationId: string) => {
    if (loading) {
      throw new Error("Already deleting obligation");
    }
    dispatch(setLoading(true));
    try {
      await axios.delete(`/api/obligation/${obligationId}`);
      dispatch(deleteObligationAction(obligationId));
      dispatch(setError(null));
    } catch (err: any) {
      dispatch(setError(err.message || "Error deleting obligation"));
      throw err;
    } finally {
      dispatch(setLoading(false));
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
