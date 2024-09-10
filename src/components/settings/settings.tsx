import React from "react";
import { useAppSelector } from "@/lib/hooks/redux";
import { UserAvatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import CustomLink from "@/components/ui/customLink";
import { UserPaidStatusEnum } from "@/models/appUser";

interface SettingsComponentProps {}
const SettingsComponent: React.FC<SettingsComponentProps> = () => {
  const { user, state } = useAppSelector(state => state.auth);

  return (
    state === "authenticated" && (
      <div className="sm:p-2 rounded-lg w-full flex flex-col items-end">
        <CustomLink href="/settings" className="w-fit h-fit">
          <UserAvatar
            photoURL={user?.photoURL || "/images/default-profile.png"}
            displayName={user?.displayName}
            imageClassName="rounded-full hover:cursor-pointer !w-10 !h-10 shadow-md"
            className={cn(
              "w-10 h-10 md:hover:shadow-lg md:hover:cursor-pointer rounded-full",
              {
                "border-[2px] border-primary":
                  user?.meta?.paidStatus === UserPaidStatusEnum.Premium,
              },
            )}
            hideTooltip
          />
        </CustomLink>
      </div>
    )
  );
};

export default SettingsComponent;
