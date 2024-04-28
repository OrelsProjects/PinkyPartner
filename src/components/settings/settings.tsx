import React from "react";
import { FaCog } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface SettingsComponentProps {}

const SettingsComponent: React.FC<SettingsComponentProps> = () => {
  const router = useRouter();

  return (
    <div
      onClick={() => {
        router.push("settings");
      }}
    >
      <FaCog className="text-muted-foreground h-6 w-6" />
    </div>
  );
};

export default SettingsComponent;
