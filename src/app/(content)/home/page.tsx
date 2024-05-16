"use client";

import React from "react";
import { useObligations } from "../../../lib/hooks/useObligations";
import { useAppSelector } from "../../../lib/hooks/redux";
import { useContracts } from "../../../lib/hooks/useContracts";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import ContractsAccordion from "../../../components/contractAccordion/contractsAccordion";
import { EventTracker } from "../../../eventTracker";
import ContractObligationsComponent from "../../../components/ContractObligationsComponent";
import {
  getToken,
  requestPermission,
} from "../../../lib/services/notification";

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
        <div>Le&apos;s start with making a promise</div>
        <Button
          onClick={() => {
            EventTracker.track("create_promise_from_home");
            router.push("/promises/new");
          }}
          className="bg-primary text-white"
        >
          Create a promise
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

  const [token, setToken] = React.useState<string | null>(null);

  if (!loadingData) {
    if (contracts.length === 0 && obligations.length === 0) {
      return <EmptyObligations />;
    }

    if (contracts.length === 0) {
      return <EmptyContracts />;
    }
  }

  const getPermission = async () => {
    const token = await getToken();
    setToken(token || null);
  };

  return (
    <div className="w-full h-fit flex flex-col gap-4 relative mt-11">
      <Button onClick={() => getPermission()}>
        Get Permission for Notifications
      </Button>
      <span className="text-red-500">{token}</span>
      <Button
        onCanPlay={() => {
          navigator.clipboard.writeText(token || "");
          alert("Token copied to clipboard");
        }}
      >
        Copy token
      </Button>
      <ContractObligationsComponent
        userData={contractObligations}
        partnerData={partnerData.contractObligations}
        loading={loadingData}
      />
    </div>
  );
}
