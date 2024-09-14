import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StepProps {
  label?: string;
  maxSteps: number;
  labelNext?: string;
  currentStep?: number;
  done?: boolean;
}

const RadialBorder = ({
  fraction,
  className,
}: {
  fraction: number;
  className?: string;
}) => {
  const radius = 40; // radius of the circle
  const circumference = 2 * Math.PI * radius; // circumference of the circle
  const strokeDashoffset = circumference * (1 - fraction); // offset for the arc

  return (
    <motion.svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      className={cn("block overflow-visible h-40 w-40", className)}
    >
      <motion.circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke="hsl(var(--foreground))"
        strokeWidth="8"
      />
      <motion.circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        transform="rotate(-90 60 60)"
        style={{ transition: "stroke-dashoffset 0.35s" }}
        className="transition-all ease-in-out duration-300 rounded-full flex items-center justify-center text-white"
      />
    </motion.svg>
  );
};

const Step: React.FC<StepProps> = ({
  done,
  label,
  labelNext,
  currentStep,
  maxSteps,
}) => {
  const isCompleted = useMemo(
    () => currentStep === maxSteps,
    [currentStep, maxSteps],
  );

  const stepsPortion = useMemo(
    () => (currentStep ? currentStep / maxSteps : done ? 1 : 0),
    [currentStep, maxSteps],
  );

  return (
    <div className="w-fit h-fit flex flex-col items-start ml-4">
      <div className={`flex items-center justify-center h-40 w-40 relative`}>
        <RadialBorder fraction={stepsPortion} className="absolute inset-0" />
        {isCompleted ? (
          <motion.div
            className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white"
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            ✔
          </motion.div>
        ) : (
          <div
            className={`rounded-full flex items-center justify-center text-xl font-bold`}
          >
            {currentStep} / {maxSteps}
          </div>
        )}
      </div>
      <div
        className={`flex flex-col items-start justify-center text-white text-sm font-medium mt-2`}
      >
        <p className="text-2xl font-semibold">{label}</p>
        <p className="font-light">Next: {labelNext}</p>
      </div>
    </div>
  );
};

interface StepperProps {
  steps: string[];
  nextStep?: number;
  currentStep?: number;
  className?: string;
}

const Stepper: React.FC<StepperProps> = ({
  steps,
  nextStep,
  currentStep,
  className,
}) => {
  return (
    <div className={cn("flex", className)}>
      <Step
        key={`step-${currentStep}`}
        label={currentStep ? steps[currentStep] : undefined}
        labelNext={nextStep ? steps[nextStep] : undefined}
        currentStep={currentStep}
        maxSteps={steps.length}
        done={!!currentStep || currentStep === steps.length}
      />
    </div>
  );
};

export default Stepper;
