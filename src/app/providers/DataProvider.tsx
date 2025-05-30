"use client";

import axios from "axios";
import React, { useEffect, useRef } from "react";
import { UserData } from "@/lib/models/appUser";
import { useObligations } from "@/lib/hooks/useObligations";
import { useContracts } from "@/lib/hooks/useContracts";
import useAuth from "@/lib/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { Logger } from "@/logger";
import { setForceFetch } from "@/lib/features/auth/authSlice";

export default function DataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const { state } = useAppSelector(state => state.auth);
  const { isDataFetched, forceFetch } = useAppSelector(state => state.auth);
  const { setDataFetched } = useAuth();
  const {
    setObligations,
    setLoadingData: setLoadingDataObligations,
    fetchNextUpObligations,
  } = useObligations();
  const { setContracts, setLoadingData: setLoadingDataContracts } =
    useContracts();
  const isFetchingData = useRef(false);

  useEffect(() => {
    fetchUserData();
  }, [forceFetch]);

  const fetchUserData = async () => {
    if (state !== "authenticated") return;
    if (isDataFetched && !forceFetch) return;
    if (isFetchingData.current) return;
    dispatch(setForceFetch(false));
    isFetchingData.current = true;
    setLoadingDataContracts(true);
    try {
      // Making both API requests in parallel
      const [userDataResponse, _] = await Promise.allSettled([
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
  }, [state, isDataFetched]);

  return children;
}
