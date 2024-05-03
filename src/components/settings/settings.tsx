import React from "react";
import { FaCog } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useAppSelector } from "../../lib/hooks/redux";
import Image from "next/image";
import { UserAvatar } from "../ui/avatar";

interface SettingsComponentProps {}

const SettingsComponent: React.FC<SettingsComponentProps> = () => {
  const router = useRouter();
  const { user } = useAppSelector(state => state.auth);

  return (
    <div
      onClick={() => {
        router.push("/settings");
      }}
      className="p-2 rounded-lg"
    >
      <UserAvatar
        photoURL={user?.photoURL || "/images/default-profile.png"}
        displayName={user?.displayName}
        className="rounded-full hover:cursor-pointer w-10 h-10"
      />
    </div>
  );
};

export default SettingsComponent;
