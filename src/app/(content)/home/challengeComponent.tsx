import axios from "axios";
import React, { useEffect, useMemo } from "react";
import { DotLottiePlayer } from "@dotlottie/react-player";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { ContractWithExtras } from "@/models/contract";
import { Button } from "@/components/ui/button";
import { EventTracker } from "@/eventTracker";
import Loading from "../../../components/ui/loading";
import { useContracts } from "../../../lib/hooks/useContracts";
import { Logger } from "../../../logger";
import { useAppSelector } from "../../../lib/hooks/redux";

export interface ChallengeComponentProps {
  contractId: string;
  open: boolean;
  onClose: () => void;
}

export default function ChallengeComponent({
  contractId,
  open,
  onClose,
}: ChallengeComponentProps) {
  const { user } = useAppSelector(state => state.auth);
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<ContractWithExtras | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [joined, setJoined] = React.useState(false);

  const { joinContract, loading: loadingJoin } = useContracts();

  const fetchData = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await axios.get<ContractWithExtras>(
        `/api/contract/${contractId}`,
      );
      const { data } = response;
      setData(data);
    } catch (error: any) {
      Logger.error("Error fetching contract", error);
      setError("We couldn't find the contract..");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleJoin = async () => {
    EventTracker.track("Challenge Joined", {
      contractId,
    });
    try {
      await joinContract(contractId);
      setJoined(true);
    } catch (error: any) {
      Logger.error("Error joining contract", error);
      setError("We couldn't join the contract..");
    }
  };

  const isUserInContract = useMemo(
    () => user && data?.signatures.map(c => c.userId).includes(user.userId),
    [user, data],
  );

  const contractOwner = useMemo(
    () =>
      data?.contractees?.find(signature => signature.userId === data.creatorId),
    [data],
  );

  const signaturesWithoutOwner = useMemo(
    () =>
      data?.signatures?.filter(
        signature => signature.userId !== data.creatorId,
      ) || [],
    [data],
  );

  const LoadingContent = () => (
    <DialogContent className="!h-[50%]">
      <Loading spinnerClassName="w-16 h-16" text="Loading your challenge..." />
    </DialogContent>
  );

  const ErrorContent = () => (
    <DialogContent className="!h-[50%] flex flex-col gap-2 justify-center items-center">
      <div className="relative h-32 w-32">
        <DotLottiePlayer
          src="/error.lottie.json"
          autoplay
          loop={false}
          className="!h-full !w-full"
        />
      </div>
      <div className="text-center">{error}</div>
    </DialogContent>
  );

  // same as error, but with check.lottie.json
  const UserInContractContent = () => (
    <DialogContent className="!h-[50%] flex flex-col gap-2 justify-center items-center">
      <div className="relative h-32 w-32">
        <DotLottiePlayer
          src="/check.lottie.json"
          autoplay
          loop={false}
          onEvent={event => {
            if (event === "complete") {
              setTimeout(() => {
                onClose();
              }, 2000);
            }
          }}
          className="!h-full !w-full"
        />
      </div>
      <div className="text-center">You are already in this challenge!</div>
    </DialogContent>
  );

  // same lottie as already in contract, but with different text
  const JoinedSuccessfulyContent = () => (
    <DialogContent className="!h-[50%] flex flex-col gap-2 justify-center items-center">
      <div className="relative h-32 w-32">
        <DotLottiePlayer
          src="/check.lottie.json"
          autoplay
          loop={false}
          onEvent={event => {
            if (event === "complete") {
              setTimeout(() => {
                onClose();
              }, 2000);
            }
          }}
          className="!h-full !w-full"
        />
      </div>
      <div className="text-center">You joined the challenge!</div>
    </DialogContent>
  );

  return (
    <Dialog
      open={open}
      onOpenChange={open => {
        if (!open) {
          onClose();
        }
      }}
    >
      {loading ? (
        <LoadingContent />
      ) : error ? (
        <ErrorContent />
      ) : isUserInContract ? (
        <UserInContractContent />
      ) : joined ? (
        <JoinedSuccessfulyContent />
      ) : (
        <DialogContent className="flex flex-col items-center justify-start gap-0">
          <DialogHeader className="font-semibold tracking-wide text-xl">
            You&apos;ve been invited!
          </DialogHeader>
          <div className="flex flex-col gap-6">
            <div className="w-full justify-center items-center flex flex-col gap-1">
              <div className="relative h-32 w-32">
                <DotLottiePlayer
                  src="/challenge.confetti.json"
                  autoplay
                  loop={1}
                  className="!h-full !w-full"
                />
              </div>
              {contractOwner && (
                <span className="text-center font-light text-sm">
                  {contractOwner.displayName} <br /> has invited you to a
                  challenge!
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold line-clamp-2">{data?.title}</span>
              <ul>
                {data?.obligations.map(obligation => (
                  <li key={obligation.obligationId}>• {obligation.title}</li>
                ))}
              </ul>
            </div>
            <div className="h-fit flex flex-col gap-0 mt-8">
              <div className="text-xs text-foreground/80 text-center mb-1">
                {signaturesWithoutOwner.length > 0
                  ? `${signaturesWithoutOwner.length} have already joined`
                  : `Be the first to join!`}
              </div>
              <Button
                // primary colored shadow
                className="shadow shadow-primary"
                onClick={handleJoin}
                disabled={loading}
                loading={loadingJoin}
              >
                Take my pinky!
              </Button>
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
