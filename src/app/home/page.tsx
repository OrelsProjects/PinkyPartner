"use client";

import React from "react";
import { useObligations } from "../../lib/hooks/useObligations";
import ObligationComponent, {
  ObligationComponentLoading,
} from "../../components/obligationComponent";
import { AnimatePresence, motion } from "framer-motion";
import { Skeleton } from "../../components/ui/skeleton";

export default function Home() {
  const { obligationsToComplete, loading } = useObligations();

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
          : obligationsToComplete?.map(obligationInContract => (
              <div
                className="w-full flex flex-col gap-1"
                key={`contract-${obligationInContract.contract.contractId}`}
              >
                <h2 className="text-lg font-semibold">
                  {obligationInContract.contract.title}
                </h2>
                <div className="w-full flex flex-col items-start justify-start gap-3">
                  {obligationInContract.obligations.map(obligation => (
                    <AnimatePresence key={`obligation-${obligationInContract}`}>
                      <motion.div className="w-full flex items-center justify-center md:items-start md:justify-start">
                        <ObligationComponent
                          obligation={obligation}
                          showComplete
                        />
                      </motion.div>
                    </AnimatePresence>
                  ))}
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
