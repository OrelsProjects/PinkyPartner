import React from "react";
import { useAppSelector } from "@/lib/hooks/redux";
import { UserAvatar } from "../ui/avatar";
import Link from "next/link";

interface SettingsComponentProps {}

const SettingsComponent: React.FC<SettingsComponentProps> = () => {
  const { user, state } = useAppSelector(state => state.auth);

  return (
    state === "authenticated" && (
      <div className="sm:p-2 rounded-lg w-full flex flex-col items-end">
        <Link href="/settings" className="w-fit h-fit">
          <UserAvatar
            photoURL={user?.photoURL || "/images/default-profile.png"}
            displayName={user?.displayName}
            imageClassName="rounded-full hover:cursor-pointer !w-10 !h-10 shadow-md"
            className="w-10 h-10 md:hover:shadow-lg md:hover:cursor-pointer rounded-full"
            hideTooltip
          />
        </Link>
      </div>
    )
  );
};

export default SettingsComponent;
