"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { NavigationBarItem, BottomBarItems } from "./_consts";
import { cn } from "../../lib/utils";

interface SideNavigationBar {
  ref?: React.RefObject<HTMLDivElement>;
  className?: string;
}

const SideNavigationBar: React.FC<SideNavigationBar> = ({ ...props }) => {
  const [items] = useState([...BottomBarItems]);
  const [activeItem, setActiveItem] = useState<NavigationBarItem | undefined>(
    items[0],
  );
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setActiveItem(items.find(i => pathname.includes(i.href)));
  }, [pathname]);

  const handleItemClick = (item: NavigationBarItem) => {
    console.log("item", item);
    router.push(item.href);
  };

  const isItemActive = (item: NavigationBarItem) =>
    item.href === activeItem?.href;

  return (
    <div
      className={cn(
        "hidden lg:sticky lg:flex lg:w-60 inset-x-0 bottom-0 lg:left-0 z-40 bg-base-200 border-base-content/10 select-none",
        props.className,
      )}
      ref={props.ref}
    >
      <div className="h-16 w-fit flex flex-col gap-2">
        {items.map(item => (
          <div
            className={cn(
              "w-fit h-full flex flex-row items-center justify-start p-4 cursor-pointer rounded-lg hover:bg-muted/50",
              {
                "bg-muted/50": isItemActive(item),
              },
            )}
            key={item.href}
            onClick={() => handleItemClick(item)}
          >
            <div className="flex flex-row gap-2 justify-center items-center">
              <span className="indicator">
                <span className="badge badge-xs badge-primary indicator-item indicator-end border-base-200" />
                {isItemActive(item) ? <item.iconActive /> : <item.icon />}
              </span>
              <span className="hidden md:inline tracking-tight uppercase font-semibold text-muted-foreground">
                {item.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SideNavigationBar;
