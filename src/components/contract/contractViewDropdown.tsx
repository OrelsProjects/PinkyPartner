import React from "react";
import { HiDotsVertical } from "react-icons/hi";
import { FiEdit2 as Edit } from "react-icons/fi";
import { FaRegEye as View } from "react-icons/fa";
import { IoExitOutline as OptOut } from "react-icons/io5";
import { FaUserPlus as Invite } from "react-icons/fa6";
import { IoStatsChartOutline as Stats } from "react-icons/io5";

import { cn } from "../../lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface ContractViewDropdownProps {
  className?: string;
  onView?: () => void;
  onEdit?: () => void;
  onInvite?: () => void;
  onOptOut?: () => void;
  onShowStats?: () => void;
}

const ContractViewDropdown: React.FC<ContractViewDropdownProps> = ({
  onView,
  onEdit,
  onOptOut,
  onInvite,
  onShowStats,
  className,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="!outline-none p-2 md:p-0">
        <HiDotsVertical className="h-5 w-5 hover:cursor-pointer rounded-full" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className={cn("w-fit bg-card", className)}>
        <DropdownMenuGroup>
          {onShowStats && (
            <DropdownMenuItem
              onClick={e => {
                e.stopPropagation();
                onShowStats();
              }}
            >
              <Stats className="mr-2 h-4 w-4" />
              <span>Stats</span>
            </DropdownMenuItem>
          )}
          {onInvite && (
            <DropdownMenuItem
              onClick={e => {
                e.stopPropagation();
                onInvite();
              }}
            >
              <Invite className="mr-2 h-4 w-4" />
              <span>Invite</span>
            </DropdownMenuItem>
          )}
          {onView && (
            <DropdownMenuItem
              onClick={e => {
                e.stopPropagation();
                onView();
              }}
            >
              <View className="mr-2 h-4 w-4" />
              <span>View</span>
            </DropdownMenuItem>
          )}
          {onEdit && (
            <DropdownMenuItem
              onClick={e => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
          )}
          {onOptOut && (
            <DropdownMenuItem
              onClick={e => {
                e.stopPropagation();
                onOptOut?.();
              }}
            >
              <OptOut className="mr-2 h-4 w-4 text-destructive" />
              <span className="text-destructive">Opt out</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ContractViewDropdown;
