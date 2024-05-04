import React from "react";
import { AccordionTrigger } from "../ui/accordion";
import { cn } from "../../lib/utils";

interface AccordionTriggerMainProps {
  children: React.ReactNode;
  className?: string;
}

const AccordionTriggerMain: React.FC<AccordionTriggerMainProps> = ({
  children,
  className,
}) => {
  return (
    <AccordionTrigger
      className={cn(
        "h-fit w-full relative flex justify-between font-bold tracking-wide shadow-md hover:shadow-lg hover:cursor-pointer rounded-lg px-3 border-[1px] border-foreground/10 bg-card/70",
        className,
      )}
    >
      {children}
    </AccordionTrigger>
  );
};

export default AccordionTriggerMain;
