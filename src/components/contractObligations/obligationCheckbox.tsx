import React, { useEffect, useMemo } from "react";
import { Checkbox } from "../ui/checkbox";
import { DotLottiePlayer } from "@dotlottie/react-player";
import "@dotlottie/react-player/dist/index.css";
import { useAppSelector } from "../../lib/hooks/redux";
import { selectAuth } from "../../lib/features/auth/authSlice";

interface ObligationCheckboxProps {
  day: string;
  index: number;
  dummy?: boolean; // For onboarding
  loading: boolean;
  isCompleted?: boolean;
  onCompletedChange: (day: string, isCompleted: boolean) => void;
}

const ObligationCheckbox: React.FC<ObligationCheckboxProps> = ({
  day,
  index,
  dummy,
  loading,
  isCompleted,
  onCompletedChange,
}) => {
  const { user } = useAppSelector(selectAuth);
  const [checked, setChecked] = React.useState(false);
  const [shouldPlaySound, setShouldPlaySound] = React.useState(false);
  const [shouldAnimate, setShouldAnimate] = React.useState(false);

  const canPlaySound = useMemo(() => {
    return user?.settings.soundEffects;
  }, [user]);

  useEffect(() => {
    if (shouldAnimate) {
      setTimeout(() => {
        setShouldAnimate(false);
      }, 3000);
    }
    if (shouldPlaySound) {
      setTimeout(() => {
        setShouldPlaySound(false);
      }, 500);
    }
  }, [shouldAnimate, shouldPlaySound]);

  useEffect(() => {
    if (checked || isCompleted) {
      if (canPlaySound) {
        if (shouldPlaySound) {
          new Audio("/sounds/obligation-completed.wav").play();
          setShouldAnimate(true);
        } else {
          return;
        }
      }
    }
  }, [checked, isCompleted, canPlaySound]);

  return (
    <div className="h-7 md:h-8 w-7 md:w-8 flex justify-center items-center self-center relative">
      <Checkbox
        className="w-full h-full self-center rounded-lg border-foreground/70 data-[state=checked]:bg-gradient-to-t data-[state=checked]:from-primary data-[state=checked]:to-primary-lighter data-[state=checked]:text-foreground data-[state=checked]:border-primary z-20"
        checked={dummy ? checked : isCompleted}
        onCheckedChange={(checked: boolean) => {
          if (dummy) {
            setChecked(checked);
          } else {
            onCompletedChange(day, checked);
          }
          setShouldPlaySound(true);
        }}
        data-onboarding-id={index === 0 ? "home-start-doing" : ""}
        variant="default"
        loading={loading}
      />
      {(checked || isCompleted) && shouldAnimate && (
        <DotLottiePlayer
          src="/confetti.lottie"
          autoplay
          className="!w-96 !h-96 absolute -top-[11rem] -left-[11rem] z-10 rotate-90"
        />
      )}
    </div>
  );
};

export default ObligationCheckbox;
