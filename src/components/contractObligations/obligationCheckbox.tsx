import React, { useEffect, useMemo } from "react";
import { Checkbox } from "../ui/checkbox";
import { DotLottiePlayer } from "@dotlottie/react-player";
import "@dotlottie/react-player/dist/index.css";
import { useAppSelector } from "../../lib/hooks/redux";
import { selectAuth } from "../../lib/features/auth/authSlice";
import { cn } from "../../lib/utils";

interface ObligationCheckboxProps {
  day: string;
  index: number;
  dummy?: boolean; // For onboarding
  disabled?: boolean;
  loading?: boolean;
  isCompleted?: boolean;
  forceSound?: boolean;
  onCompletedChangeDummy?: (isCompleted: boolean) => void;
  onCompletedChange?: (day: string, isCompleted: boolean) => void;
}

const ObligationCheckbox: React.FC<ObligationCheckboxProps> = ({
  day,
  index,
  dummy,
  loading,
  disabled,
  forceSound, // Force sound to play when isCompleted is true, even if the checkbox was not checked by the user
  isCompleted,
  onCompletedChange,
  onCompletedChangeDummy,
}) => {
  const { user, state } = useAppSelector(selectAuth);
  const [checked, setChecked] = React.useState(false);
  const [shouldPlaySound, setShouldPlaySound] = React.useState(false);
  const [shouldAnimate, setShouldAnimate] = React.useState(false);

  const audio = useMemo(() => {
    return new Audio("/sounds/obligation-completed.wav");
  }, []);

  const canPlaySound = useMemo(() => {
    return user?.settings.soundEffects || state !== "authenticated";
  }, [user, state]);

  useEffect(() => {
    if (!dummy && !onCompletedChange) {
      throw new Error("onCompletedChange is required when dummy is false");
    }
  }, [dummy, onCompletedChange]);

  useEffect(() => {
    if (shouldAnimate) {
      setTimeout(() => {
        setShouldAnimate(false);
      }, 3000);
    }
    if (shouldPlaySound) {
      setTimeout(() => {
        setShouldPlaySound(false);
        // reset audio
        audio.pause();
        audio.currentTime = 0;
        // destroy audio, because it will show as playable in the browser or phone
        audio.src = "";
        audio.load();
      }, 2000);
    }
  }, [shouldAnimate, shouldPlaySound]);

  const playSound = () => {
    audio.src = "/sounds/obligation-completed.wav";
    audio.load();
    audio.play().finally(() => {
      setShouldAnimate(true);
    });
  };

  useEffect(() => {
    if (isCompleted) {
      if (canPlaySound && shouldPlaySound) {
        playSound();
      }
    }
  }, [checked, isCompleted, canPlaySound]);

  return (
    <div
      className={cn(
        "h-7 md:h-8 w-7 md:w-8 flex justify-center items-center self-center relative",
      )}
    >
      <Checkbox
        className={cn(
          "w-full h-full self-center rounded-lg border-foreground/70 data-[state=checked]:bg-gradient-to-t data-[state=checked]:from-primary data-[state=checked]:to-primary-lighter data-[state=checked]:text-foreground data-[state=checked]:border-primary z-20",
          {
            "hover:cursor-default": disabled,
          },
        )}
        checked={isCompleted}
        onCheckedChange={(checked: boolean) => {
          if (disabled) return;
          if (dummy) {
            setChecked(checked);
            onCompletedChangeDummy?.(checked);
          } else {
            onCompletedChange?.(day, checked);
          }
          setShouldPlaySound(checked);
        }}
        data-onboarding-id={index === 0 ? "complete-promise-checkbox" : ""}
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
