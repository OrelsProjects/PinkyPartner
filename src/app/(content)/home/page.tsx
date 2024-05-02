"use client";

import React, { useEffect, useMemo } from "react";
import { useObligations } from "../../../lib/hooks/useObligations";
import ObligationComponent, {
  ObligationComponentLoading,
} from "../../../components/obligationComponent";
import { AnimatePresence, motion } from "framer-motion";
import { Skeleton } from "../../../components/ui/skeleton";
import Divider from "../../../components/ui/divider";
import ObligationCompleted from "../../../models/obligationCompleted";
import Contract from "../../../models/contract";
import { useAppSelector } from "../../../lib/hooks/redux";
import { ObligationsInContracts } from "../../../models/obligation";
import { cn } from "../../../lib/utils";
import { Switch } from "../../../components/ui/switch";
import useNotifications from "../../../lib/hooks/useNotifications";
import NotificationBadge from "../../../components/ui/notificationBadge";
import { useContracts } from "../../../lib/hooks/useContracts";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";

type GroupedObligations = {
  [key: string]: {
    contract: Contract;
    obligations: ObligationCompleted[];
  };
};

const EmptyContracts = () => (
  <div className="w-full h-full flex justify-center items-center">
    <h1 className="text-lg font-normal">No contracts to show</h1>
  </div>
);

const EmptyObligations = () => {
  const router = useRouter();
  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-3">
      <h1 className="text-xl font-semibold">
        Seems like you didn&apos;t promise anyhting yet.. 🤔
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

const Loading = () =>
  Array.from({ length: 3 }).map((_, index) => (
    <div className="flex last:hidden last:lg:flex flex-col gap-2" key={index}>
      <Skeleton className="w-24 h-6" />
      <ObligationComponentLoading />
    </div>
  ));

const NextUp = ({
  loading,
  obligationsToComplete,
  user,
  partner,
  className,
}: {
  loading?: boolean;
  obligationsToComplete: ObligationsInContracts;
  user?: { photoURL?: string | null } | null;
  partner?: boolean;
  className?: string;
}) => {
  const sortedObligations = useMemo(() => {
    if (!obligationsToComplete) return [];
    return [...obligationsToComplete]?.sort(
      (a, b) =>
        new Date(a.contract.createdAt).getTime() -
        new Date(b.contract.createdAt).getTime(),
    );
  }, [obligationsToComplete]);

  return (
    <div
      className={cn(
        "w-full lg:w-fit h-full flex flex-col gap-4 overflow-auto pb-1",
        className,
      )}
    >
      <div className="w-full lg:w-fit h-full flex flex-col gap-3">
        {loading ? (
          <Loading />
        ) : (
          sortedObligations.map(
            obligationInContract =>
              obligationInContract.obligations.length > 0 && (
                <div
                  className="w-full flex flex-col gap-1"
                  key={`contract-${obligationInContract.contract.contractId}`}
                >
                  <h2 className="text-lg font-normal">
                    {obligationInContract.contract.title}
                  </h2>
                  <div className="w-full flex flex-col items-start justify-start gap-3">
                    {obligationInContract.obligations.map(obligation => (
                      <AnimatePresence
                        key={`obligation-${obligation.obligationId}`} // Changed key to be unique per obligation
                      >
                        <motion.div
                          className="w-full flex items-center justify-center md:items-start md:justify-start"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <ObligationComponent
                            obligation={obligation}
                            contract={obligationInContract.contract}
                            showComplete={!partner}
                            ownerImageUrl={
                              partner
                                ? obligationInContract.appUser?.photoURL
                                : ""
                            }
                          />
                        </motion.div>
                      </AnimatePresence>
                    ))}
                  </div>
                </div>
              ),
          )
        )}
      </div>
    </div>
  );
};

const Done = ({
  loading,
  groupedObligations,
  user,
  partner,
  className,
}: {
  groupedObligations: GroupedObligations;
  user?: { photoURL?: string | null } | null;
  loading?: boolean;
  partner?: boolean;
  className?: string;
}) => {
  return (
    <div className={cn("w-full lg:w-fit h-full overflow-auto pb-1", className)}>
      <div className="w-full lg:w-fit h-full flex flex-col gap-3 pr-4">
        {loading ? (
          <Loading />
        ) : (
          groupedObligations &&
          Object.values(groupedObligations).map(group => (
            <div
              key={`group-${group.contract.contractId}`}
              className="w-full flex flex-col gap-1"
            >
              <h2 className="text-lg font-normal">{group.contract.title}</h2>
              <div className="w-full flex flex-col items-start justify-start gap-3">
                {group.obligations
                  .sort(
                    (a, b) =>
                      new Date(b.completedAt).getTime() -
                      new Date(a.completedAt).getTime(),
                  )
                  .map(obligationCompleted => (
                    <AnimatePresence
                      key={`obligation-${obligationCompleted.obligationCompletedId}`}
                    >
                      <motion.div
                        className="w-full flex items-center justify-center relative md:items-start md:justify-start overflow-visible"
                        initial={{ x: -100 }}
                        animate={{ x: 0 }}
                        exit={{ x: -100 }}
                        transition={{ duration: 0.5 }}
                      >
                        <NotificationBadge
                          count={
                            !partner || obligationCompleted.viewedAt ? 0 : 1
                          }
                          className="absolute -top-1 -right-3 w-3 h-3"
                        />
                        <ObligationComponent
                          obligation={obligationCompleted.obligation}
                          contract={group.contract}
                          completedAt={obligationCompleted.completedAt}
                          ownerImageUrl={
                            partner
                              ? obligationCompleted.appUser?.photoURL
                              : user?.photoURL
                          }
                        />
                      </motion.div>
                    </AnimatePresence>
                  ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default function Home() {
  const { user } = useAppSelector(state => state.auth);
  const {
    obligationsToComplete,
    obligationsCompleted,
    partnerData,
    obligations,
    loadingData,
    loadingPartner,
  } = useObligations();

  const { contracts } = useContracts();

  const { newObligations, markObligationsAsViewed } = useNotifications();

  useEffect(() => {
    if (!loadingPartner && newObligations.length > 0) {
      setTimeout(() => {
        markObligationsAsViewed();
      }, 2000);
    }
  }, [newObligations, loadingPartner]);

  const [showPartner, setShowPartner] = React.useState(false); // For small screens

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

  if (contracts.length === 0 && obligations.length === 0) {
    return <EmptyObligations />;
  }

  if (contracts.length === 0) {
    return <EmptyContracts />;
  }

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <Switch
        checked={showPartner}
        onCheckedChange={setShowPartner}
        className="w-10"
        containerClassName="lg:hidden"
        textUnder={showPartner ? "Partner" : "You"}
      />
      <h1 className="text-xl font-bold">Next up</h1>
      <div className="w-full h-4/10 min-h-[40%] flex-shrink-0 flex flex-row justify-between">
        <NextUp
          loading={loadingData}
          obligationsToComplete={obligationsToComplete}
          user={{
            photoURL: user?.photoURL,
          }}
          className={`${showPartner ? "hidden" : "flex"} lg:flex`}
        />
        <NextUp
          loading={loadingPartner}
          obligationsToComplete={partnerData.obligationsToComplete}
          partner
          className={`${showPartner ? "flex" : "hidden"} lg:flex`}
        />
      </div>
      <Divider className="w-full" />
      {Object.keys(groupedObligationsCompleted).length > 0 && (
        <h1 className="text-xl font-bold">Done</h1>
      )}
      <div className="w-full h-4/10 min-h-[40%] flex flex-row justify-between">
        <Done
          loading={loadingData}
          groupedObligations={groupedObligationsCompleted}
          user={{
            photoURL: user?.photoURL,
          }}
          className={`${showPartner ? "hidden" : "flex"} lg:flex`}
        />
        <Done
          loading={loadingPartner}
          groupedObligations={partnersGroupedObligationsCompleted}
          partner
          className={`${showPartner ? "flex" : "hidden"} lg:flex`}
        />
      </div>
    </div>
  );
}
