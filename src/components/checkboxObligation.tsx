import React from "react";
import Obligation from "../models/obligation";
import { useObligations } from "../lib/hooks/useObligations";
import { Checkbox } from "./ui/checkbox";
import Loading from "./ui/loading";
import { toast } from "react-toastify";
import Contract from "../models/contract";

interface CheckboxObligationProps {
  obligation: Obligation;
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
      toast.success("You've completed " + obligation.title + "!");
    } catch (error: any) {
      toast.error("Something happened... try again?");
    } finally {
      setLoadingComplete(false);
    }
  };

  return (
    <div>
      {loadingComplete ? (
        <Loading className="w-6 h-6 fill-primary" />
      ) : (
        <Checkbox
          className="w-6 h-6"
          onCheckedChange={(e: any) => {
            handleComplete();
          }}
        />
      )}
    </div>
  );
};

export default CheckboxObligation;
