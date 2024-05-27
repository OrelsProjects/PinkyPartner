import React from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "../../lib/hooks/redux";
import { UserAvatar } from "../ui/avatar";
import Link from "next/link";

interface SettingsComponentProps {}

const SettingsComponent: React.FC<SettingsComponentProps> = () => {
  const router = useRouter();
  const { user } = useAppSelector(state => state.auth);

  return (
    <Link href="/settings"
      className="p-2 rounded-lg w-full flex flex-col items-end "
    >
      <div className="h-fit w-fit md:hover:shadow-lg md:hover:cursor-pointer rounded-full">
        <UserAvatar
          photoURL={user?.photoURL || "/images/default-profile.png"}
          displayName={user?.displayName}
          imageClassName="rounded-full hover:cursor-pointer w-10 h-10 shadow-md"
        />
      </div>
    </Link>
  );
};

export default SettingsComponent;
