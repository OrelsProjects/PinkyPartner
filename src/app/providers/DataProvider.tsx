"use client";

import axios from "axios";
import React, { useEffect, useRef } from "react";
import { UserData } from "../../models/appUser";
import { useObligations } from "../../lib/hooks/useObligations";
import { useContracts } from "../../lib/hooks/useContracts";

export default function DataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setObligations } = useObligations();
  const { setContracts } = useContracts();
  const isFetchingData = useRef(false);

  const fetchUserData = async () => {
    try {
      if (isFetchingData.current) return;
      isFetchingData.current = true;
      const response = await axios.get<UserData>("/api/user/data");
      setObligations(response.data.obligations ?? []);
      setContracts(response.data.contracts ?? []);
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
