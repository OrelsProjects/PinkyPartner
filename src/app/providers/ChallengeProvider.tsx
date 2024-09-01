"use client";

import { usePathname, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo } from "react";
import ChallengeComponent from "../(content)/home/challengeComponent";
import useOnboarding from "../../lib/hooks/useOnboarding";

export default function ChallengeProvider() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { isOnboardingCompleted } = useOnboarding();
  const [showChallenge, setShowChallenge] = React.useState(false);

  const challengeId = searchParams.get("challengeId");
  const signedUp = searchParams.get("signedUp");

  const isInLandingPage = useMemo(() => pathname === "/", [pathname]);

  useEffect(() => {
    if (!isOnboardingCompleted() && !isInLandingPage) {
      return;
    }
    if (challengeId) {
      setShowChallenge(true);
    } else {
      setShowChallenge(false);
    }
  }, [isOnboardingCompleted]);

  return (
    challengeId && (
      <ChallengeComponent
        contractId={challengeId}
        open={showChallenge}
        signUp={signedUp === "true"}
        onClose={() => {
          setShowChallenge(false);
          const currentPath = window.location.pathname;
          if (currentPath === "/") {
            return; // If the user is in the landing page and wants to explore the app before sign up, keep the challenge alive.
          }
          window.history.replaceState({}, "", currentPath);
        }}
      />
    )
  );
}
