"use client";

import * as React from "react";
import "react-toastify/dist/ReactToastify.css";
import SizeContext from "../../lib/context/sizeContext";
import NavigationBar from "../../components/navigationBar";
import { ThemeProvider } from "./ThemeProvider";
import * as toast from "react-toastify";
import SettingsComponent from "../../components/settings/settings";
import { useAppSelector } from "../../lib/hooks/redux";
import { cn } from "../../lib/utils";
import { useEffect } from "react";
import * as NProgress from "nprogress";
import { useTheme } from "next-themes";
import LiveChatProvider from "./LiveChatProvider";
import axios from "axios";
import { Button } from "../../components/ui/button";

interface ContentProviderProps {
  children: React.ReactNode;
}

const BOTTOM_BAR_HEIGHT = 65;

const ContentProvider: React.FC<ContentProviderProps> = ({ children }) => {
  const { user, state } = useAppSelector(state => state.auth);
  const { theme } = useTheme();
  const sizeContent = React.useContext(SizeContext);
  const bottomBarRef = React.useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = React.useState<number>(
    sizeContent.height,
  );
  ("use client");

  useEffect(() => {
    NProgress.start();
    NProgress.configure({ showSpinner: false });

    NProgress.set(0.4);

    const random = Math.floor(Math.random() * 1000) + 500;

    setTimeout(() => {
      NProgress.done();
      NProgress.remove();
    }, random);
  }, []);

  React.useEffect(() => {
    if (bottomBarRef.current) {
      setContentHeight(sizeContent.height - bottomBarRef.current.clientHeight);
    } else {
      setContentHeight(sizeContent.height - BOTTOM_BAR_HEIGHT);
    }
  }, [sizeContent.height, bottomBarRef, bottomBarRef.current]);

  return (
    <div className="w-screen h-screen md:h-[100vh] flex flex-col relative">
      <div
        className={cn("w-full lg:max-w-[65rem] mx-auto lg:flex p-4 relative", {
          "pb-[calc(max(env(safe-area-inset-bottom), 16px) - 16px)]": user,
        })}
        style={{
          height: contentHeight,
          maxHeight: contentHeight,
        }}
      >
        <NavigationBar ref={bottomBarRef} />

        <ThemeProvider>
          <div className="relative z-[51]">
            <toast.ToastContainer
              stacked
              newestOnTop
              theme={theme === "system" ? "light" : theme}
              autoClose={2500}
              draggablePercent={60}
              className="!mb-16 z-[51]"
              transition={toast.Flip}
              position="bottom-center"
              pauseOnHover={false}
            />
          </div>
          {/* <Button
            className="absolute top-0 right-0 p-4 z-[5555] bg-primary text-white"
            onClick={() => {
              axios.post("/api/migrate");
            }}
          >
            Migrate
          </Button> */}
          <div className="w-full h-full flex flex-col relative z-10 overflow-auto">
            {user && <SettingsComponent />}
            {children}
          </div>
        </ThemeProvider>
        <LiveChatProvider />
      </div>
    </div>
  );
};

export default ContentProvider;
