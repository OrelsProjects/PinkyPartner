"use client";

import React, { useEffect, useMemo } from "react";
import { useAppSelector } from "../../../lib/hooks/redux";
import { Button } from "../../../components/ui/button";
import { EventTracker } from "../../../eventTracker";
import ContractObligationsComponent from "../../../components/contractObligations/contractObligationsComponent";
import Link from "next/link";
import ChallengeComponent from "./challengeComponent";
import { useParams, useRouter, useSearchParams } from "next/navigation";

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
  const searchParams = useSearchParams();
  const { contractObligations, partnersData } = useAppSelector(
    state => state.obligations,
  );
  const { state } = useAppSelector(state => state.auth);
  const { loading, loadingData } = useAppSelector(state => state.obligations);
  const { contracts } = useAppSelector(state => state.contracts);

  const [showChallenge, setShowChallenge] = React.useState(false);

  const challengeId = useMemo(() => {
    return searchParams.get("challengeId");
  }, []);

  useEffect(() => {
    if (challengeId) {
      setShowChallenge(true);
    } else {
      setShowChallenge(false);
    }
  }, [challengeId]);

  const isEmptyContracts = useMemo(
    () =>
      !loading &&
      !loadingData &&
      contracts.length === 0 &&
      state !== "anonymous",
    [loading, loadingData, contracts, state],
  );

  return (
    <div className="w-full h-fit flex flex-col gap-4 relative">
      {challengeId && (
        <ChallengeComponent
          contractId={challengeId}
          open={showChallenge}
          onClose={() => {
            setShowChallenge(false);
            window.history.replaceState({}, "", "/home");
          }}
        />
      )}
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
  );
}
