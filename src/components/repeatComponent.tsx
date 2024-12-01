import React from "react";
import Obligation from "../lib/models/obligation";
import { dayNumberToName } from "../lib/utils/dateUtils";
import { timesAWeekToText } from "../lib/utils/textUtils";

interface RepeatComponentProps {
  obligation: Obligation;
  dueDate?: string | null;
  showFullDay?: boolean;
}

const RepeatComponent: React.FC<RepeatComponentProps> = ({
  obligation,
  dueDate,
  showFullDay,
}) => {
  if (obligation.repeat.toLocaleLowerCase() === "daily") {
    return (
      <span className="text-sm font-light text-muted-foreground">
        {dueDate ||
          obligation.days
            .map(day =>
              showFullDay
                ? dayNumberToName(day)
                : dayNumberToName(day).slice(0, 2),
            )
            .join(", ")}
      </span>
    );
  } else {
    return (
      <span className="text-sm font-light text-muted-foreground">
        {timesAWeekToText(obligation.timesAWeek)}
      </span>
    );
  }
};

export default RepeatComponent;
