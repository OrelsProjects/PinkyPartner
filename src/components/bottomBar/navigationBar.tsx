"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { BottomBarItem, BottomBarItems } from "./_consts";
import { Button } from "../ui/button";

interface NavigationBar {
  ref?: React.RefObject<HTMLDivElement>;
}

const NavigationBar: React.FC<NavigationBar> = ({ ...props }) => {
  const [items] = useState([...BottomBarItems]);
  const [activeItem, setActiveItem] = useState<BottomBarItem>(items[0]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setActiveItem(items.find(i => pathname.includes(i.href)) || items[0]);
  }, [pathname]);

  const handleItemClick = (item: BottomBarItem) => {
    router.push(item.href);
  };

  return (
    <div
      className="lg:hidden fixed inset-x-0 bottom-0 z-40 pb-[calc(max(env(safe-area-inset-bottom),16px)-16px)] bg-base-200 border-t border-base-content/10 select-none"
      ref={props.ref}
    >
      <div className="h-16 w-full flex">
        {items.map(item => (
          <div
            className="flex-1 flex items-center justify-center cursor-pointer"
            key={item.href}
          >
            <div
              onClick={() => handleItemClick(item)}
              className="flex flex-col gap-2 justify-center items-center"
            >
              <span className="indicator">
                <span className="badge badge-xs badge-primary indicator-item indicator-end border-base-200" />
                {item.href === activeItem.href ? (
                  <item.iconActive />
                ) : (
                  <item.icon />
                )}
              </span>
              <span className="md:hidden text-[0.7rem] leading-3 tracking-tight capitalize -mt-0.5 font-medium text-base-content/75">
                {item.label}
              </span>
              <span className="hidden md:inline tracking-tight ml-4 uppercase font-semibold text-base-content/75">
                {item.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NavigationBar;
