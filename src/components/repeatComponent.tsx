import React from "react";
import Obligation from "../models/obligation";
import { dayNumberToName } from "../lib/utils/dateUtils";

interface RepeatComponentProps {
  obligation: Obligation;
}

const RepeatComponent: React.FC<RepeatComponentProps> = ({ obligation }) => {
  if (obligation.repeat.toLocaleLowerCase() === "daily") {
    return (
      <span className="text-sm font-light text-muted-foreground">
        {obligation.days
          .map(day => dayNumberToName(day).slice(0, 2))
          .join(", ")}
      </span>
    );
  } else {
    return (
      <span className="text-sm font-light text-muted-foreground">
        {obligation.timesAWeek} times a week
      </span>
    );
  }
};

export default RepeatComponent;
