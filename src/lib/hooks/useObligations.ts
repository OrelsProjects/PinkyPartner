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

  const fetchObligations = async () => {
    dispatch(setLoading(true));
    try {
      const response = await axios.get("/api/obligation");
      dispatch(setObligationsAction(response.data.result));
      dispatch(setError(null));
    } catch (err: any) {
      dispatch(setError(err.message || "Error fetching obligations"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const createObligation = async (obligationData: CreateObligation) => {
    dispatch(setLoading(true));
    try {
      const response = await axios.post("/api/obligation", obligationData);
      dispatch(createObligationAction(response.data.result));
      dispatch(setError(null));
    } catch (err: any) {
      dispatch(setError(err.message || "Error creating obligation"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const updateObligation = async (obligationData: Obligation) => {
    dispatch(setLoading(true));
    try {
      const response = await axios.patch(
        `/api/obligation/${obligationData.obligationId}`,
        obligationData,
      );
      dispatch(updateObligationAction(response.data.result));
      dispatch(setError(null));
    } catch (err: any) {
      dispatch(setError(err.message || "Error updating obligation"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const deleteObligation = async (obligationId: string) => {
    dispatch(setLoading(true));
    try {
      await axios.delete(`/api/obligation/${obligationId}`);
      dispatch(deleteObligationAction(obligationId));
      dispatch(setError(null));
    } catch (err: any) {
      dispatch(setError(err.message || "Error deleting obligation"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    obligations,
    loading,
    error,
    fetchObligations,
    createObligation,
    updateObligation,
    deleteObligation,
  };
}
