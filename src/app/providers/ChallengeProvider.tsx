"use client";

import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect } from "react";
import ChallengeComponent from "../(content)/home/challengeComponent";

export default function ChallengeProvider() {
  const searchParams = useSearchParams();
  const [showChallenge, setShowChallenge] = React.useState(false);

  const challengeId = searchParams.get("challengeId");
  const signedUp = searchParams.get("signedUp");

  useEffect(() => {
    if (challengeId) {
      setShowChallenge(true);
    } else {
      setShowChallenge(false);
    }
  }, []);

  return (
    challengeId && (
      <Suspense fallback={null}>
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
      </Suspense>
    )
  );
}
