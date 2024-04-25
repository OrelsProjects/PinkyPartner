"use client";

import * as React from "react";
import SizeContext from "../../lib/context/sizeContext";
import NavigationBar from "../../components/bottomBar";
import { ThemeProvider } from "./ThemeProvider";
import * as toast from "react-toastify";

interface ContentProviderProps {
  children: React.ReactNode;
}

const BOTTOM_BAR_HEIGHT = 65;

const ContentProvider: React.FC<ContentProviderProps> = ({ children }) => {
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
    <div className="w-screen h-screen flex flex-col">
      <div
        className="p-4 overflow-auto"
        style={{
          height: contentHeight,
          maxHeight: contentHeight,
        }}
      >
        <ThemeProvider>
          <div className="w-full h-full relative">
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
      </div>
      <NavigationBar ref={bottomBarRef} />
    </div>
  );
};

export default ContentProvider;
