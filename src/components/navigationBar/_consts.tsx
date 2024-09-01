import { ElementType } from "react";
import { GoHomeFill as HomeActive, GoHome as Home } from "react-icons/go";
import {
  RiFilePaper2Line as Contracts,
  RiFilePaper2Fill as ContractsActive,
} from "react-icons/ri";
import {
  MdOutlineWorkspacePremium as Plans,
  MdWorkspacePremium as PlansActive,
} from "react-icons/md";

export interface NavigationBarItem {
  icon: ElementType;
  iconActive: ElementType;
  label: "Home" | "Promises" | "Contracts" | "Premium";
  href: string;
  header?: string;
}

const className = "w-6 h-6 fill-muted-foreground/40 text-muted-foreground/40";
const classNameActive = "w-6 h-6 fill-muted-foreground";

export const BottomBarItems: NavigationBarItem[] = [
  {
    icon: () => <Home className={className} />,
    iconActive: () => <HomeActive className={classNameActive} />,
    label: "Home",
    href: "/home",
    header: "Home | PinkyPartner",
  },
  {
    icon: () => <Contracts className={className} />,
    iconActive: () => <ContractsActive className={classNameActive} />,
    label: "Contracts",
    href: "/contracts",
    header: "Contracts | PinkyPartner",
  },
  {
    icon: () => <Plans className={className} />,
    iconActive: () => <PlansActive className={classNameActive} />,
    label: "Premium",
    href: "/pricing",
    header: "Pricing | PinkyPartner",
  },
];
