"use client";

import axios from "axios";
import React, { useEffect, useRef } from "react";
import { UserData } from "../../models/appUser";
import { useObligations } from "../../lib/hooks/useObligations";
import { useContracts } from "../../lib/hooks/useContracts";
import { ObligationsInContracts } from "../../models/obligation";
import useAuth from "../../lib/hooks/useAuth";
import { useAppSelector } from "../../lib/hooks/redux";

export default function DataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isDataFetched } = useAppSelector(state => state.auth);
  const { setDataFetched } = useAuth();
  const {
    setObligations,
    addObligationsToComplete,
    setLoadingData: setLoadingDataObligations,
  } = useObligations();
  const { setContracts, setLoadingData: setLoadingDataContracts } =
    useContracts();
  const isFetchingData = useRef(false);

  const fetchUserData = async () => {
    try {
      if (isDataFetched) return;
      if (isFetchingData.current) return;
      isFetchingData.current = true;
      setLoadingDataContracts();
      setLoadingDataObligations();
      const userDataResponse = await axios.get<UserData>("/api/user/data");
      const obligationsToCompleteResponse =
        await axios.get<ObligationsInContracts>("/api/obligations/next-up");
      const userObligations = {
        ...userDataResponse.data,
        obligationsToComplete: obligationsToCompleteResponse.data,
      };

      const { obligations, contracts, obligationsToComplete } = userObligations;
      setObligations(obligations || []);
      setContracts(contracts || []);
      addObligationsToComplete(obligationsToComplete || []);
      setDataFetched();
    } catch (error: any) {
    } finally {
      isFetchingData.current = false;
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return children;
}
