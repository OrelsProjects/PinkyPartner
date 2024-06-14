import React from "react";
import StepFlow from "./stepFlow"; // Make sure the path is correct
import ShowContentContainer from "./showContentContainer";

interface CardItem {
  icon: string;
  title: string;
  body?: string;
}

const items: CardItem[] = [
  {
    icon: "🤝",
    title: "Create a contract",
    body: "Make your promise",
  },
  {
    icon: "💌",
    title: "Invite a partner",
    body: "Share a link via popular apps.",
  },
  {
    icon: "🌱",
    title: "Build new habits",
    body: "Start building your habits together.",
  },
];

const Walkthrough: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-4 text-foreground/70">
      <ShowContentContainer
        className="font-semibold text-4xl md:text-5xl tracking-tight mb-4 md:mb-6 text-center"
        variant="main"
        animate={false}
      >
        <span>Building habits</span>
        <span className="text-secondary/50"> alone is hard.</span>
        <br />
        <div className="mt-4" />
        <span>It&apos;s much</span>
        <span className="text-primary"> easier with a partner.</span>
      </ShowContentContainer>
      <StepFlow items={items} />
    </div>
  );
};

export default Walkthrough;
