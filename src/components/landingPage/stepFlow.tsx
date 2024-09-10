
import React from 'react';
import { FaArrowRightLong } from "react-icons/fa6";
import { cn } from "@/lib/utils";
import ShowContentContainer from "./showContentContainer";

interface CardItem {
  icon: string;
  title: string;
  body?: string;
}

const Card = ({ icon, title, body }: CardItem) => (
  <div className="h-72 w-72 card">
    <div className="card-content">
      <span className="text-4xl md:text-6xl">{icon}</span>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-lg md:text-xl font-semibold md:pb-2">
          {title}
        </div>
        <div className="hidden md:flex font-thin">{body}</div>
      </div>
    </div>
  </div>
);

interface StepFlowProps {
  items: CardItem[];
}

const StepFlow: React.FC<StepFlowProps> = ({ items }) => {
  return (
    <div className="md: w-full flex flex-col md:flex-row md:justify-between items-center gap-4 md:gap-8">
      {items.map((item, index) => (
        <ShowContentContainer
          variant="main"
          key={`walkthrough-card-${index}`}
          className="flex flex-col md:flex-row gap-4 md:gap-8 justify-start items-center"
        >
          <Card {...item} />
          <FaArrowRightLong
            className={cn(
              "text-3xl text-foreground/60 rotate-90 md:rotate-0",
              {
                hidden: index === items.length - 1,
              },
            )}
          />
        </ShowContentContainer>
      ))}
    </div>
  );
};

export default StepFlow;
