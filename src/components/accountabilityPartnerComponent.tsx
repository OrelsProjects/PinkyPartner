import React from "react";
import { AccountabilityPartner } from "../models/appUser";
import { Skeleton } from "./ui/skeleton";
import { UserAvatar } from "./ui/avatar";

export const AccountabilityPartnerComponentLoading = ({
  className,
}: {
  className?: string;
}) => (
  <div
    className={`flex flex-col gap-1 justify-start items-center animate-all ${className}`}
  >
    <Skeleton className="w-10 h-10 rounded-full" />
    <Skeleton className="w-20 h-5 rounded-lg" />
  </div>
);

const AccountabilityPartnerComponent: React.FC<{
  partner?: AccountabilityPartner;
  signed?: boolean;
  className?: string;
  onClick?: (partner: AccountabilityPartner) => void;
}> = ({ partner, signed, onClick, className }) => {
  return (
    <div
      className={`w-fit h-fit flex flex-col gap-1 justify-start items-center animate-all ${!signed && "grayscale opacity-50"} ${className}`}
      onClick={e => {
        e.preventDefault();
        if (partner) {
          onClick?.(partner);
        }
      }}
    >
      <UserAvatar
        displayName={partner?.displayName}
        photoURL={partner?.photoURL}
        className="hover:cursor-pointer"
        imageClassName="w-10 h-10 hover:cursor-pointer"
      />
      <div key={partner?.userId} className="truncate">
        {partner?.displayName}
      </div>
    </div>
  );
};

export default AccountabilityPartnerComponent;
