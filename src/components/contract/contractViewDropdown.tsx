import React from "react";
import { HiDotsVertical } from "react-icons/hi";
import { FiEdit2 as Edit } from "react-icons/fi";
import { FaRegEye as View } from "react-icons/fa";
import { IoExitOutline as OptOut } from "react-icons/io5";
import { FaUserPlus as Invite } from "react-icons/fa6";

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
}

const ContractViewDropdown: React.FC<ContractViewDropdownProps> = ({
  onView,
  onEdit,
  onOptOut,
  onInvite,
  className,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <HiDotsVertical className="h-5 w-5 hover:cursor-pointer hover:bg-slate-400/40 rounded-full" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className={cn("w-fit bg-card", className)}>
        <DropdownMenuGroup>
          {onInvite && (
            <DropdownMenuItem>
              <Invite className="mr-2 h-4 w-4" />
              <span
                onClick={e => {
                  e.stopPropagation();
                  onInvite();
                }}
              >
                Invite
              </span>
            </DropdownMenuItem>
          )}
          {onView && (
            <DropdownMenuItem>
              <View className="mr-2 h-4 w-4" />
              <span
                onClick={e => {
                  e.stopPropagation();
                  onView();
                }}
              >
                View
              </span>
            </DropdownMenuItem>
          )}
          {onEdit && (
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              <span
                onClick={e => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                Edit
              </span>
            </DropdownMenuItem>
          )}
          {onOptOut && (
            <DropdownMenuItem>
              <OptOut className="mr-2 h-4 w-4 text-destructive" />
              <span
                onClick={e => {
                  e.stopPropagation();
                  onOptOut?.();
                }}
                className="text-destructive"
              >
                Opt out
              </span>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ContractViewDropdown;
