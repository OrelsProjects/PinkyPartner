"use client";

import React from "react";
import { useObligations } from "../../../lib/hooks/useObligations";
import { useAppSelector } from "../../../lib/hooks/redux";
import { useContracts } from "../../../lib/hooks/useContracts";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { EventTracker } from "../../../eventTracker";
import ContractObligationsComponent from "../../../components/ContractObligationsComponent";

const EmptyContracts = () => {
  const router = useRouter();
  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-3">
      <h1 className="text-xl font-semibold">
        Seems like your pinky is ready to meet another pinky.. 😉
      </h1>
      <div className="w-full flex justify-center items-center flex-col">
        <Button
          onClick={() => {
            EventTracker.track("create_contract_from_home");
            router.push("/contracts/new");
          }}
          className="bg-primary text-white"
        >
          Make it official!
        </Button>
      </div>
    </div>
  );
};

const EmptyObligations = () => {
  const router = useRouter();
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
            router.push("/contracts/new");
          }}
          className="bg-primary text-white"
        >
          Create a contract
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
  const { contracts } = useContracts();

  if (!loadingData) {
    if (contracts.length === 0 && obligations.length === 0) {
      return <EmptyObligations />;
    }

    if (contracts.length === 0) {
      return <EmptyContracts />;
    }
  }

  return (
    <div
      className="w-full h-fit flex flex-col gap-4 relative"
      data-onboarding-id="home-start-doing"
    >
      <ContractObligationsComponent
        userData={contractObligations}
        partnerData={partnerData.contractObligations}
        loading={loadingData}
      />
    </div>
  );
}
