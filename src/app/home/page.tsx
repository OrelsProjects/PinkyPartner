"use client";

import React, { useEffect } from "react";
import * as NProgress from "nprogress";
import { useObligations } from "../../lib/hooks/useObligations";
import ObligationComponent from "../../components/obligationComponent";
import { AnimatePresence, motion } from "framer-motion";

export default function Home() {
  const { obligationsToComplete } = useObligations();

  useEffect(() => {
    NProgress.start();
    NProgress.inc(0.5);
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <h1 className="text-xl font-bold">Next up</h1>
      <div className="w-full flex flex-col gap-3">
        {obligationsToComplete?.map(obligationInContract => (
          <div
            className="w-full"
            key={`contract-${obligationInContract.contract.contractId}`}
          >
            <h2 className="text-lg font-semibold">
              {obligationInContract.contract.title}
            </h2>
            <div className="w-full flex flex-col items-start justify-start gap-2">
              {obligationInContract.obligations.map(obligation => (
                <AnimatePresence key={`obligation-${obligationInContract}`}>
                  <motion.div
                    // initial={{ opacity: 0, x: 100 }}
                    // animate={{ opacity: 1, x: 0 }}
                    // exit={{ opacity: 0, x: -100 }}
                    // transition={{ duration: 0.5 }}
                    className="w-full flex items-center justify-center"
                  >
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
