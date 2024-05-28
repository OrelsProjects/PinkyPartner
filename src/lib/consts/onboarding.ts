export const specialSigns = ["~", "-"];

export type Stage =
  | "welcome"
  | "navigation-bar-item-Contracts"
  | "contracts-plus-button"
  | "search-partner"
  | "no-partner"
  | "fill-contract"
  | "invite-partner-button"
  | "wait-for-partner"
  | "home-start-doing"
  | "done";

export const stages: Stage[] = [
  "welcome",
  "navigation-bar-item-Contracts",
  "contracts-plus-button",
  "search-partner",
  "no-partner",
  "fill-contract",
  "invite-partner-button",
  "wait-for-partner",
  "home-start-doing",
  "done",
];

export const timeDelays: Record<Stage, number> = {
  welcome: 0,
  "navigation-bar-item-Contracts": 2000,
  "contracts-plus-button": 200,
  "search-partner": 2500,
  "no-partner": 2300,
  "fill-contract": 0,
  "invite-partner-button": 0,
  "wait-for-partner": 200,
  "home-start-doing": 3000,
  done: 0,
};

export const shouldFetchElement: Record<Stage, boolean> = {
  welcome: false,
  "navigation-bar-item-Contracts": true,
  "contracts-plus-button": true,
  "search-partner": true,
  "no-partner": true,
  "fill-contract": false,
  "invite-partner-button": true,
  "wait-for-partner": false,
  "home-start-doing": true,
  done: false,
};

export const hasMobileVersion: Record<Stage, boolean> = {
  welcome: false,
  "navigation-bar-item-Contracts": true,
  "contracts-plus-button": false,
  "search-partner": false,
  "no-partner": false,
  "fill-contract": false,
  "invite-partner-button": false,
  "wait-for-partner": false,
  "home-start-doing": false,
  done: false,
};

export const stageText: Record<
  Stage,
  {
    title: string;
    description: string;
  }
> = {
  welcome: {
    title: "Welcome to Pinky Partner!",
    description: `With Pinky Partner you can easily build new habits with your partner.`,
  },
  "navigation-bar-item-Contracts": {
    title: "Let's begin!",
    description: "Go to your contracts section.",
  },
  "contracts-plus-button": {
    title: "",
    description: "Create your first contract by clicking the plus button.",
  },
  "search-partner": {
    title: "Find your Pinky Partner",
    description:
      "Here you can search for your partner.\n~-If your partner is not on PinkyPartner, invite them from the settings menu-~",
  },
  "no-partner": {
    title: "Continue solo! For now...",
    description: "You can start solo and invite your partner later on.",
  },
  "fill-contract": {
    title: "",
    description: "",
  },
  "invite-partner-button": {
    title: "Invite your partner",
    description: "Here you can share a link via your selected platform.",
  },
  "wait-for-partner": {
    title: "Wait for your partner's pinky!",
    description:
      "Now your pinky partner got a notification to come sign the contract. Make sure to remind them ;)\n~-You can start solo and your partner will join later.-~",
  },
  "home-start-doing": {
    title: "Get to work!",
    description:
      "Now start building your habits while your partner is on the way.",
  },
  done: {
    title: "Done",
    description: "You have completed the onboarding",
  },
};

export const backgroundForNextStage: Record<Stage, boolean> = {
  welcome: true,
  "navigation-bar-item-Contracts": false,
  "contracts-plus-button": false,
  "search-partner": false,
  "no-partner": false,
  "fill-contract": false,
  "invite-partner-button": false,
  "wait-for-partner": true,
  "home-start-doing": false,
  done: false,
};

export const showBackground: Record<Stage, boolean> = {
  welcome: true,
  "navigation-bar-item-Contracts": true,
  "contracts-plus-button": true,
  "search-partner": true,
  "no-partner": true,
  "fill-contract": false,
  "invite-partner-button": true,
  "wait-for-partner": true,
  "home-start-doing": true,
  done: false,
};

export const requiredPaths: Record<Stage, string | null> = {
  welcome: null,
  "navigation-bar-item-Contracts": "/home",
  "contracts-plus-button": "/contracts",
  "search-partner": "/contracts/new",
  "no-partner": "/contracts/new",
  "fill-contract": null,
  "invite-partner-button": "/contracts/new",
  "wait-for-partner": "/contracts",
  "home-start-doing": "/home",
  done: null,
};
