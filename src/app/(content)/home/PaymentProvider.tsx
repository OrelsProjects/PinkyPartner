"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCustomRouter } from "@/lib/hooks/useCustomRouter";
import { Dialog, DialogContent } from "../../../components/ui/dialog";
import { DotLottiePlayer } from "@dotlottie/react-player";

// If payment==success, show success message

export default function PaymentProvider() {
  const router = useCustomRouter();
  const params = useSearchParams();
  const [isPaymentSuccess, setIsPaymentSuccess] = React.useState(false);

  useEffect(() => {
    const paymentSuccess = params.get("payment") === "success";
    if (paymentSuccess) {
      setIsPaymentSuccess(true);
      playSound();
    }
  }, [params]);

  const getAudio = async () => {
    return new Audio("/sounds/payment-success.wav");
  };

  const playSound = async () => {
    const audio = await getAudio();
    audio.src = "/sounds/payment-success.wav";
    audio.load();
    audio.play();
  };

  const closeDialog = () => {
    setIsPaymentSuccess(false);
    router.push("/home", {
      preserveQuery: null,
    });
  };

  return isPaymentSuccess ? (
    <>
      <Dialog
        open={isPaymentSuccess}
        onOpenChange={open => {
          if (!open) {
            closeDialog();
          }
        }}
      >
        <DialogContent closeOnOutsideClick>
          <div className="w-screen h-screen absolute z-50">
            <DotLottiePlayer
              src="/payment-success.lottie"
              className="!w-96 !h-96 absolute z-50"
              autoplay
              loop
            />
          </div>
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-2xl text-center">Thank you!</h2>
            <p className="text-center">As an official pinker, you can now:</p>
            {/* bulleted list of: create as many promises as you want in a contract, invite as many people as you want to a contract, create a challenge and receive special offers to new products! */}
            <ul>
              <li>• Create as many promises as you want in a contract</li>
              <li>• Invite as many people as you want to a contract</li>
              <li>• Create a challenge</li>
              <li>• Receive special offers to new products</li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </>
  ) : null;
}
