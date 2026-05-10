import { Provider } from "react-redux";
import { store } from "@/store/index";
import Class from "@/pages/teacher/note-board/class";
import AppBar from "./component/app-bar";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "@/contexts/session-context";
import { useEffect } from "react";
import { resetClassRuntime } from "@/store/class-action-slice";
import { forceResetGlobalTimer } from "@/hooks/useGlobalTimer";

// Inner component that has access to Redux dispatch
const ClassRoomInner = () => {
  useEffect(() => {
    // Check if we're continuing from a saved draft
    const continueSessionId = localStorage.getItem('continueSessionId');

    if (!continueSessionId) {
      // Only reset if NOT continuing from draft
      // This ensures fresh start for new classes, but preserves state for draft continuation
      forceResetGlobalTimer();
      store.dispatch(resetClassRuntime());
    }
    // If continuing from draft, class.tsx will handle the state restoration
  }, []);

  return (
    <>
      <SessionProvider>
        <Toaster position="bottom-center" />
        <AppBar />
        <div>
          <Class />
        </div>
      </SessionProvider>
    </>
  );
};

const ClassRoom = () => {
  return (
    <div className="">
      <Provider store={store}>
        <ClassRoomInner />
      </Provider>
    </div>
  );
};

export default ClassRoom;