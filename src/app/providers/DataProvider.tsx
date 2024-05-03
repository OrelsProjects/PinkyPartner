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
    setLoadingData: setLoadingDataObligations,
    fetchNextUpObligations,
  } = useObligations();
  const { setContracts, setLoadingData: setLoadingDataContracts } =
    useContracts();
  const isFetchingData = useRef(false);

  const fetchUserData = async () => {
    try {
      if (isDataFetched) return;
      if (isFetchingData.current) return;
      isFetchingData.current = true;
      setLoadingDataContracts(true);

      // Making both API requests in parallel
      const [userDataResponse, _] =
        await Promise.allSettled([
          axios.get<UserData>("/api/user/data"),
          fetchNextUpObligations(),
        ]);

      const userData =
        userDataResponse.status === "fulfilled"
          ? userDataResponse.value.data
          : {
              obligations: [],
              contracts: [],
            };

      const { obligations, contracts } = userData;
      setObligations(obligations || []);
      setContracts(contracts || []);
      setLoadingDataContracts(false);
      setLoadingDataObligations(false);
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
