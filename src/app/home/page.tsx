"use client";

import React, { useMemo } from "react";
import { useObligations } from "../../lib/hooks/useObligations";
import ObligationComponent, {
  ObligationComponentLoading,
} from "../../components/obligationComponent";
import { AnimatePresence, motion } from "framer-motion";
import { Skeleton } from "../../components/ui/skeleton";
import Divider from "../../components/ui/divider";
import ObligationCompleted from "../../models/obligationCompleted";
import Contract from "../../models/contract";
import { useAppSelector } from "../../lib/hooks/redux";
import { ObligationsInContracts } from "../../models/obligation";

type GroupedObligations = {
  [key: string]: {
    contract: Contract;
    obligations: ObligationCompleted[];
  };
};

const Content = ({
  loading,
  obligationsToComplete,
  obligationsCompleted: groupedObligations,
  user,
}: {
  loading: boolean;
  obligationsToComplete: ObligationsInContracts;
  obligationsCompleted: GroupedObligations; // Now generic
  user?: { photoURL?: string | null } | null;
}) => {

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <h1 className="text-xl font-bold">Next up</h1>
      <div className="w-full flex flex-col gap-3">
        {loading
          ? Array.from({ length: 5 }).map((_, index) => (
              <div className="flex flex-col gap-1" key={index}>
                <Skeleton className="w-24 h-6" />
                <ObligationComponentLoading />
              </div>
            ))
          : obligationsToComplete?.map(
              obligationInContract =>
                obligationInContract.obligations.length > 0 && (
                  <div
                    className="w-full flex flex-col gap-1"
                    key={`contract-${obligationInContract.contract.contractId}`}
                  >
                    <h2 className="text-lg font-semibold">
                      {obligationInContract.contract.title}
                    </h2>
                    <div className="w-full flex flex-col items-start justify-start gap-3">
                      {obligationInContract.obligations.map(obligation => (
                        <AnimatePresence
                          key={`obligation-${obligationInContract}`}
                        >
                          <motion.div
                            className="w-full flex items-center justify-center md:items-start md:justify-start"
                            // Slide left
                            initial={{ x: 100 }}
                            animate={{ x: 0 }}
                            exit={{ x: 100 }}
                            transition={{ duration: 0.5 }}
                          >
                            <ObligationComponent
                              obligation={obligation}
                              contractId={
                                obligationInContract.contract.contractId
                              }
                              showComplete
                              ownerImageUrl={
                                obligationInContract.appUser?.photoURL ||
                                user?.photoURL
                              }
                            />
                          </motion.div>
                        </AnimatePresence>
                      ))}
                    </div>
                  </div>
                ),
            )}
      </div>
      <Divider className="w-full my-4" />

      {groupedObligations &&
        Object.values(groupedObligations).map(group => (
          <div
            key={`group-${group.contract.contractId}`}
            className="w-full flex flex-col gap-1"
          >
            <h2 className="text-lg font-semibold">{group.contract.title}</h2>
            <div className="w-full flex flex-col items-start justify-start gap-3">
              {group.obligations.map(obligationCompleted => (
                <AnimatePresence
                  key={`obligation-${obligationCompleted.obligationCompletedId}`}
                >
                  <motion.div
                    className="w-full flex items-center justify-center md:items-start md:justify-start"
                    // slide from left to right
                    initial={{ x: -100 }}
                    animate={{ x: 0 }}
                    exit={{ x: -100 }}
                    transition={{ duration: 0.5 }}
                  >
                    <ObligationComponent
                      obligation={obligationCompleted.obligation}
                      contractId={group.contract.contractId}
                      completedAt={obligationCompleted.completedAt}
                      ownerImageUrl={
                        user?.photoURL || obligationCompleted?.appUser?.photoURL
                      }
                    />
                  </motion.div>
                </AnimatePresence>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
};

export default function Home() {
  const { user } = useAppSelector(state => state.auth);
  const { obligationsToComplete, obligationsCompleted, partnerData, loading } =
    useObligations();

  const groupObligations = (
    obligations: ObligationCompleted[],
  ): GroupedObligations =>
    obligations.reduce(
      (acc: GroupedObligations, obligation: ObligationCompleted) => {
        const contractId = obligation.contract.contractId;
        if (!acc[contractId]) {
          acc[contractId] = {
            contract: obligation.contract,
            obligations: [],
          };
        }

        acc[contractId].obligations.push(obligation);
        return acc;
      },
      {},
    );

  const groupedObligationsCompleted = useMemo(
    () => groupObligations(obligationsCompleted),
    [obligationsCompleted],
  );

  const partnersGroupedObligationsCompleted = useMemo(
    () => groupObligations(partnerData.obligationsCompleted),
    [partnerData.obligationsCompleted],
  );

  return (
    <div className="w-full h-full flex flex-row">
      <Content
        loading={loading}
        obligationsToComplete={obligationsToComplete}
        obligationsCompleted={groupedObligationsCompleted}
        user={{
          photoURL: user?.photoURL,
        }}
      />
      <Content
        loading={loading}
        obligationsToComplete={partnerData.obligationsToComplete}
        obligationsCompleted={partnersGroupedObligationsCompleted}
        user={null}
      />
    </div>
  );
}
