import React from "react";
import { FaCog } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useAppSelector } from "../../lib/hooks/redux";
import Image from "next/image";

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
      <Image
        src={user?.photoURL || "/images/default-profile.png"}
        alt="profile"
        width={40}
        height={40}
        className="rounded-full hover:cursor-pointer"
      />
    </div>
  );
};

export default SettingsComponent;
