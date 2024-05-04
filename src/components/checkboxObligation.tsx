import React, { useMemo } from "react";
import Obligation from "../models/obligation";
import { useObligations } from "../lib/hooks/useObligations";
import { Checkbox } from "./ui/checkbox";
import Loading from "./ui/loading";
import { toast } from "react-toastify";
import Contract from "../models/contract";
import { UserContractObligationData } from "../models/userContractObligation";
import { useAppSelector } from "../lib/hooks/redux";

interface CheckboxObligationProps {
  obligation: UserContractObligationData;
  contract: Contract;
}

const CheckboxObligation: React.FC<CheckboxObligationProps> = ({
  obligation,
  contract,
}) => {
  const { user } = useAppSelector(state => state.auth);
  const { completeObligation } = useObligations();
  const [loadingComplete, setLoadingComplete] = React.useState(false);

  const completed = useMemo(
    () => obligation.completedAt !== null,
    [obligation],
  );

  const handleComplete = async () => {
    if (loadingComplete) return;
    setLoadingComplete(true);
    try {
      await completeObligation(obligation, contract.contractId, !completed);
      if (completed) {
        return;
      }
      toast.success("You've completed " + obligation.obligation.title + "!");
    } catch (error: any) {
      toast.error("Something happened... try again?");
      throw error;
    } finally {
      setLoadingComplete(false);
    }
  };

  if (obligation.userId !== user?.userId) return null;

  return loadingComplete ? (
    <Loading className="w-6 h-6 fill-primary" />
  ) : (
    <Checkbox
      className="w-6 h-6"
      onCheckedChange={(e: any) => {
        handleComplete();
      }}
      checked={completed}
    />
  );
};

export default CheckboxObligation;
