"use client";

import * as React from "react";
import "react-toastify/dist/ReactToastify.css";
import SizeContext from "../../lib/context/sizeContext";
import NavigationBar from "../../components/bottomBar";
import { ThemeProvider } from "./ThemeProvider";
import * as toast from "react-toastify";
import SettingsComponent from "../../components/settings/settings";
import { useAppSelector } from "../../lib/hooks/redux";
import { cn } from "../../lib/utils";

interface ContentProviderProps {
  children: React.ReactNode;
}

const BOTTOM_BAR_HEIGHT = 65;

const ContentProvider: React.FC<ContentProviderProps> = ({ children }) => {
  const { user } = useAppSelector(state => state.auth);
  const sizeContent = React.useContext(SizeContext);
  const bottomBarRef = React.useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = React.useState<number>(
    sizeContent.height,
  );

  React.useEffect(() => {
    if (bottomBarRef.current) {
      setContentHeight(sizeContent.height - bottomBarRef.current.clientHeight);
    } else {
      setContentHeight(sizeContent.height - BOTTOM_BAR_HEIGHT);
    }
  }, [sizeContent.height, bottomBarRef, bottomBarRef.current]);

  return (
    <div className="w-screen h-screen flex flex-col relative">
      <div
        className={cn(
          "w-full lg:max-w-[92rem] mx-auto lg:flex p-4 overflow-y-auto relative",
          {
            "pb-[calc(max(env(safe-area-inset-bottom),16px)-16px)]": user,
          },
        )}
        style={{
          height: contentHeight,
          maxHeight: contentHeight,
        }}
      >
        <ThemeProvider>
          <div className="w-full h-full relative z-10">
            {children}
            <toast.ToastContainer
              stacked
              newestOnTop
              theme="dark"
              autoClose={2500}
              draggablePercent={60}
              className="!mb-16"
              transition={toast.Flip}
              position="bottom-center"
            />
          </div>
        </ThemeProvider>
        {user && (
          <div className="absolute top-0 right-0 p-4 z-20">
            <SettingsComponent />
          </div>
        )}
      </div>
      {user && <NavigationBar ref={bottomBarRef} />}
    </div>
  );
};

export default ContentProvider;
