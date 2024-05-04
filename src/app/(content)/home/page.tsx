"use client";

import React, { useEffect, useMemo } from "react";
import { useObligations } from "../../../lib/hooks/useObligations";
import { useAppSelector } from "../../../lib/hooks/redux";
import useNotifications from "../../../lib/hooks/useNotifications";
import { useContracts } from "../../../lib/hooks/useContracts";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import ContractAccordion from "../../../components/contractAccordion/contractsAccordion";

const EmptyContracts = () => {
  const router = useRouter();
  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-3">
      <h1 className="text-xl font-semibold">
        Seems like your pinky is ready to meet another pinky.. 😉
      </h1>
      <div className="w-full flex justify-center items-center flex-col">
        <Button
          onClick={() => router.push("/contracts/new")}
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
        <div>Le&apos;s start with making a promise</div>
        <Button
          onClick={() => router.push("/promises/new")}
          className="bg-primary text-white"
        >
          Create a promise
        </Button>
      </div>
    </div>
  );
};

export default function Home() {
  const { contractObligations, partnerData } = useAppSelector(state => state.obligations);
  const { obligations, loadingData, loadingPartner } =
    useObligations();

  const { contracts } = useContracts();

  const { newObligations, markObligationsAsViewed } = useNotifications();

  useEffect(() => {
    if (!loadingPartner && newObligations.length > 0) {
      setTimeout(() => {
        markObligationsAsViewed();
      }, 2000);
    }
  }, [newObligations, loadingPartner]);

  if (!loadingData) {
    if (contracts.length === 0 && obligations.length === 0) {
      return <EmptyObligations />;
    }

    if (contracts.length === 0) {
      return <EmptyContracts />;
    }
  }

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <ContractAccordion
        userData={contractObligations}
        partnerData={partnerData.contractObligations}
      />
    </div>
  );
}

/**
 * <div className="w-full h-full flex flex-col gap-4">
      <div className="w-full h-full sm:h-fit flex flex-row items-start justify-between pr-3 sm:pr-0 mt-16 sm:mt-0">
        <h1 className="text-xl font-bold">Next up</h1>
        <Switch
          checked={showPartner}
          onCheckedChange={setShowPartner}
          className="w-10"
          containerClassName="sm:hidden w-12 flex items-center pt-1.5"
          textUnder={showPartner ? "Partner" : "You"}
        />
      </div>
      <div className="w-full h-4/10 min-h-[40%] flex-shrink-0 flex flex-row justify-between">
        <NextUp
          loading={loadingData}
          obligationsToComplete={obligationsToComplete}
        obligationsCompleted={obligationsCompleted}
      />
    </div>

 */
