import React from "react";
import { AccordionTrigger } from "../ui/accordion";

interface AccordionTriggerMainProps {
  children: React.ReactNode;
}

const AccordionTriggerMain: React.FC<AccordionTriggerMainProps> = ({
  children,
}) => {
  return (
    <AccordionTrigger className="font-bold tracking-wide shadow-md hover:shadow-lg hover:cursor-pointer rounded-lg px-3 border-[1px] border-foreground/10 bg-card/70">
      {children}
    </AccordionTrigger>
  );
};

export default AccordionTriggerMain;
