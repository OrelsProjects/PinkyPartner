"use client";

import axios from "axios";
import React, { useEffect, useRef } from "react";
import { UserData } from "../../models/appUser";
import { useObligations } from "../../lib/hooks/useObligations";
import { useContracts } from "../../lib/hooks/useContracts";
import { ObligationsInContracts } from "../../models/obligation";
import useAuth from "../../lib/hooks/useAuth";
import { useAppSelector } from "../../lib/hooks/redux";
import ObligationCompleted from "../../models/obligationCompleted";
import Contract from "../../models/contract";
import { Logger } from "../../logger";

export default function DataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isDataFetched } = useAppSelector(state => state.auth);
  const { setDataFetched } = useAuth();
  const {
    setObligations,
    setObligationsToComplete,
    setObligationsCompleted,
    setPartnerData,
    setLoadingData: setLoadingDataObligations,
    setLoadingPartnerData,
  } = useObligations();
  const { setContracts, setLoadingData: setLoadingDataContracts } =
    useContracts();
  const isFetchingData = useRef(false);

  const fetchPartnerData = async (contracts: Contract[]) => {
    const signedContracts = contracts.filter(
      ({ contractees }) => contractees.length > 1,
    );
    const contractIds = signedContracts.map(({ contractId }) => contractId);
    const params = new URLSearchParams();
    params.append("contractIds", contractIds.join(","));
    try {
      // Send a GET request to the API route
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

  const fetchUserData = async () => {
    try {
      if (isDataFetched) return;
      if (isFetchingData.current) return;
      isFetchingData.current = true;
      setLoadingDataContracts(true);
      setLoadingDataObligations(true);
      setLoadingPartnerData(true);

      // Making both API requests in parallel
      const [userDataResponse, allObligationsResponse] =
        await Promise.allSettled([
          axios.get<UserData>("/api/user/data"),
          axios.get<{
            toComplete: ObligationsInContracts;
            completed: ObligationCompleted[];
          }>("/api/obligations/next-up"),
        ]);

      const userData =
        userDataResponse.status === "fulfilled"
          ? userDataResponse.value.data
          : {
              obligations: [],
              contracts: [],
            };
      const obligationsData =
        allObligationsResponse.status === "fulfilled"
          ? allObligationsResponse.value.data
          : { toComplete: [], completed: [] };

      const userObligations = {
        ...userData,
        obligationsToComplete: obligationsData.toComplete,
        completed: obligationsData.completed,
      };

      const { obligations, contracts, obligationsToComplete, completed } =
        userObligations;
      setObligations(obligations || []);
      setContracts(contracts || []);
      setObligationsToComplete(obligationsToComplete || []);
      setObligationsCompleted(completed || []);
      setLoadingDataContracts(false);
      setLoadingDataObligations(false);
      // Fetch partner data - on signed contracts
      fetchPartnerData(contracts);
      setDataFetched();
    } catch (error: any) {
      Logger.error("Failed to fetch user data", error);
      setLoadingDataContracts(false);
      setLoadingDataObligations(false);
    } finally {
      isFetchingData.current = false;
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return children;
}