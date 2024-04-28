"use client";

import axios from "axios";
import React, { useEffect, useRef } from "react";
import { UserData } from "../../models/appUser";
import { useObligations } from "../../lib/hooks/useObligations";
import { useContracts } from "../../lib/hooks/useContracts";
import Obligation, { ObligationsInContracts } from "../../models/obligation";

export default function DataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setObligations, addObligationsToComplete } = useObligations();
  const { setContracts } = useContracts();
  const isFetchingData = useRef(false);

  const fetchUserData = async () => {
    try {
      if (isFetchingData.current) return;
      isFetchingData.current = true;
      const response = await axios.get<UserData>("/api/user/data");
      const obligationsToCompleteResponse =
        await axios.get<ObligationsInContracts>("/api/obligations/next-up");
      const userObligations = {
        ...response.data,
        obligationsToComplete: obligationsToCompleteResponse.data,
      };

      const { obligations, contracts, obligationsToComplete } = userObligations;
      setObligations(obligations || []);
      setContracts(contracts || []);
      addObligationsToComplete(obligationsToComplete || []);
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
