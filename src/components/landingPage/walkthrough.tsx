import React from "react";
import { FaArrowRightLong } from "react-icons/fa6";
import { cn } from "../../lib/utils";
import { motion } from "framer-motion";
import ShowContentContainer from "./showContentContainer";

interface WalkthroughProps {}
interface CardItem {
  icon: string;
  title: string;
  body?: string;
}

const items: CardItem[] = [
  {
    icon: "🤝",
    title: "Create a contract",
    body: "Set your promise and a due date.",
  },
  {
    icon: "💌",
    title: "Invite a partner",
    body: "Invite via most popular messaging apps.",
  },
  {
    icon: "🌱",
    title: "Build new habits",
    body: "Start solo until your partner joins.",
  },
];

const Card = ({ icon, title, body }: CardItem) => (
  <div className="h-72 w-72 card">
    <div className="card-content">
      <span className="text-4xl md:text-6xl">{icon}</span>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-lg md:text-xl font-semibold pb-2">
          {title}
        </div>
        <div className="hidden md:flex font-thin">{body}</div>
      </div>
    </div>
  </div>
);

const Walkthrough: React.FC<WalkthroughProps> = () => {
  return (
    <div className="flex flex-col items-center gap-8 text-foreground/70">
      <ShowContentContainer className="font-semibold text-4xl md:text-5xl tracking-tight mb-4 md:mb-6 text-center">
        <span>Building habits alone</span>
        <span className="text-secondary/50"> is hard.</span>
        <br />
        <br />
        <span>It&apos;s much easier</span>
        <span className="text-primary"> with a partner.</span>
      </ShowContentContainer>
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
        {items.map((item, index) => (
          <ShowContentContainer
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
    </div>
  );
};

export default Walkthrough;
