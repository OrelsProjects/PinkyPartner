import React from "react";
import Obligation from "../models/obligation";
import { useObligations } from "../lib/hooks/useObligations";
import { Checkbox } from "./ui/checkbox";
import Loading from "./ui/loading";
import { toast } from "react-toastify";
import Contract from "../models/contract";
import { UserContractObligationData } from "../models/userContractObligation";

interface CheckboxObligationProps {
  obligation: UserContractObligationData;
  contract: Contract;
}

const CheckboxObligation: React.FC<CheckboxObligationProps> = ({
  obligation,
  contract,
}) => {
  const { completeObligation } = useObligations();
  const [loadingComplete, setLoadingComplete] = React.useState(false);

  const handleComplete = async () => {
    if (loadingComplete) return;
    setLoadingComplete(true);
    try {
      await completeObligation(obligation, contract.contractId);
      toast.success("You've completed " + obligation.obligation.title + "!");
    } catch (error: any) {
      toast.error("Something happened... try again?");
      throw error;
    } finally {
      setLoadingComplete(false);
    }
  };

  return loadingComplete ? (
    <Loading className="w-6 h-6 fill-primary" />
  ) : (
    <Checkbox
      className="w-6 h-6"
      onCheckedChange={(e: any) => {
        handleComplete();
      }}
    />
  );
};

export default CheckboxObligation;
