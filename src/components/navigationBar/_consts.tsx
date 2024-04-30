import { ElementType } from "react";
import {
  IoCheckboxOutline as Obligation,
  IoCheckbox as ObligationActive,
} from "react-icons/io5";
import { GoHomeFill as HomeActive, GoHome as Home } from "react-icons/go";
import {
  RiFilePaper2Line as Contracts,
  RiFilePaper2Fill as ContractsActive,
} from "react-icons/ri";

export interface NavigationBarItem {
  icon: ElementType;
  iconActive: ElementType;
  label: string;
  href: string;
}

const className = "w-6 h-6 fill-muted-foreground/40 text-muted-foreground/40";
const classNameActive = "w-6 h-6 fill-muted-foreground";

export const BottomBarItems: NavigationBarItem[] = [
  {
    icon: () => <Home className={className} />,
    iconActive: () => <HomeActive className={classNameActive} />,
    label: "Home",
    href: "/home",
  },
  {
    icon: () => <Obligation className={className} />,
    iconActive: () => <ObligationActive className={classNameActive} />,
    label: "Obligations",
    href: "/obligations",
  },
  {
    icon: () => <Contracts className={className} />,
    iconActive: () => <ContractsActive className={classNameActive} />,
    label: "Contracts",
    href: "/contracts",
  },
];
