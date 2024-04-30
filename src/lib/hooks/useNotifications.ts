"use client";

import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./redux";
import Contract from "../../models/contract";
import ObligationCompleted from "../../models/obligationCompleted";
import { setPartnerData } from "../features/obligations/obligationsSlice";
import axios from "axios";
import { setContracts } from "../features/contracts/contractsSlice";

export default function useNotifications() {
  const dispatch = useAppDispatch();

  const { user } = useAppSelector(state => state.auth);

  const { partnerData } = useAppSelector(state => state.obligations);
  const { contracts } = useAppSelector(state => state.contracts);

  const [newContracts, setNewContracts] = React.useState<Contract[]>([]);
  const [newObligations, setNewObligations] = React.useState<
    ObligationCompleted[]
  >([]);

  useEffect(() => {
    if (partnerData.obligationsCompleted?.length > 0) {
      const newObligations = partnerData.obligationsCompleted.filter(
        obligation => !obligation.viewedAt,
      );
      setNewObligations(newObligations);
    }
  }, [partnerData]);

  useEffect(() => {
    if (contracts) {
      const newContracts = contracts.filter(
        contract =>
          !contract.signatures.some(
            signature => signature.userId === user?.userId,
          ),
      );
      setNewContracts(newContracts);
    }
  }, [contracts]);

  const markObligationsAsViewed = async () => {
    try {
      if (newObligations.length === 0) return;
      await axios.post(`/api/obligations/viewed`, {
        obligations: newObligations,
      });
      const updatedObligations = partnerData.obligationsCompleted.map(
        obligation =>
          !obligation.viewedAt
            ? { ...obligation, viewedAt: new Date().toISOString() }
            : obligation,
      );

      setNewObligations([]);
      dispatch(
        setPartnerData({
          ...partnerData,
          obligationsCompleted: updatedObligations,
        }),
      );
    } catch (error) {}
  };

  const markContractsAsViewed = async () => {
    try {
      if (newContracts.length === 0) return;
      //   await axios.post(`/api/contracts/viewed`);
      const updatedContracts = newContracts.map(contract =>
        !contract.viewedAt
          ? { ...contract, viewedAt: new Date().toISOString() }
          : contract,
      );
      setNewContracts([]);
      dispatch(setContracts(updatedContracts));
    } catch (error) {}
  };

  return {
    newContracts,
    newObligations,
    markObligationsAsViewed,
    markContractsAsViewed,
  };
}
