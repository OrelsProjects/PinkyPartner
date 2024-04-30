import React from "react";
import { FaCog } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface SettingsComponentProps {}

const SettingsComponent: React.FC<SettingsComponentProps> = () => {
  const router = useRouter();

  return (
    <div
      onClick={() => {
        router.push("/settings");
      }}
      className="p-2 rounded-lg  hover:rotate-30 hover:bg-muted/50"
    >
      <FaCog className="text-muted-foreground h-6 w-6 hover:-rotate-45 transition-all " />
    </div>
  );
};

export default SettingsComponent;
