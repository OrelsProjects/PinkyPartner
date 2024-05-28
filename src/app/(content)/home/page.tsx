"use client";

import React from "react";
import { useObligations } from "../../../lib/hooks/useObligations";
import { useAppSelector } from "../../../lib/hooks/redux";
import { useContracts } from "../../../lib/hooks/useContracts";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { EventTracker } from "../../../eventTracker";
import ContractObligationsComponent from "../../../components/contractObligations/contractObligationsComponent";
import useOnboarding from "../../../lib/hooks/useOnboarding";
import Link from "next/link";

const EmptyContracts = () => {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-3">
      <h1 className="text-xl font-semibold">
        Seems like your pinky is ready to meet another pinky.. 😉
      </h1>
      <div className="w-full flex justify-center items-center flex-col">
        <Button
          onClick={() => {
            EventTracker.track("create_contract_from_home");
          }}
          className="bg-primary text-white"
          asChild
        >
          <Link href="/contracts/new">Make it official!</Link>
        </Button>
      </div>
    </div>
  );
};

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
          <Link href="/contracts/new">Create a contract</Link>
        </Button>
      </div>
    </div>
  );
};

export default function Home() {
  const { contractObligations, partnerData } = useAppSelector(
    state => state.obligations,
  );
  const { obligations, loadingData } = useObligations();
  const { contracts } = useAppSelector(state => state.contracts);

  if (!loadingData) {
    if (contracts.length === 0 && obligations.length === 0) {
      return <EmptyObligations />;
    }

    if (contracts.length === 0) {
      return <EmptyContracts />;
    }
  }

  return (
    <div className="w-full h-fit flex flex-col gap-4 relative">
      <ContractObligationsComponent
        userData={contractObligations}
        partnerData={partnerData.contractObligations}
        loading={loadingData}
      />
    </div>
  );
}
