"use client";

import React, { Suspense, useMemo } from "react";
import { useAppSelector } from "../../../lib/hooks/redux";
import { Button } from "../../../components/ui/button";
import { EventTracker } from "../../../eventTracker";
import ContractObligationsComponent from "../../../components/contractObligations/contractObligationsComponent";
import CustomLink from "../../../components/ui/customLink";

const EmptyObligations = () => {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-3">
      <h1 className="text-xl font-semibold">
        Seems like you didn&apos;t promise anything yet.. 🤔
      </h1>
      <div className="w-full flex justify-center items-center flex-col">
        <div>Le&apos;s start with making a contract</div>
        <Button
          onClick={() => {
            EventTracker.track("create_promise_from_home");
          }}
          className="bg-primary text-white"
          asChild
        >
          <CustomLink href="/contracts/new">Create a contract</CustomLink>
        </Button>
      </div>
    </div>
  );
};

export default function Home() {
  const { contractObligations, partnersData } = useAppSelector(
    state => state.obligations,
  );
  const { state } = useAppSelector(state => state.auth);
  const { loading, loadingData } = useAppSelector(state => state.obligations);
  const { contracts } = useAppSelector(state => state.contracts);

  const isEmptyContracts = useMemo(
    () =>
      !loading &&
      !loadingData &&
      contracts.length === 0 &&
      state !== "anonymous",
    [loading, loadingData, contracts, state],
  );

  return (
    <Suspense>
      <div className="w-full h-fit flex flex-col gap-4 relative">
        {isEmptyContracts ? (
          <EmptyObligations />
        ) : (
          <ContractObligationsComponent
            userData={contractObligations}
            partnersData={partnersData}
            loading={loadingData && state !== "anonymous"}
            showReport
          />
        )}
      </div>
    </Suspense>
  );
}
