import React from "react";
import { AccordionTrigger } from "../ui/accordion";

interface AccordionTriggerMainProps {
  children: React.ReactNode;
}

const AccordionTriggerMain: React.FC<AccordionTriggerMainProps> = ({
  children,
}) => {
  return (
    <AccordionTrigger className="font-semibold mt-2 tracking-wide shadow-sm hover:cursor-pointer rounded-lg px-3 border-[1px] border-foreground/5 bg-card/40">
      {children}
    </AccordionTrigger>
  );
};

export default AccordionTriggerMain;
