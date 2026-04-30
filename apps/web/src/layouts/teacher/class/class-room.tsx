import { Provider } from "react-redux";
import { store } from "@/store/index";
import Class from "@/pages/teacher/note-board/class";
import AppBar from "./component/app-bar";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "@/contexts/session-context";

const ClassRoom = () => {
  return (
    <div className="">
      <Provider store={store}>
        {/* SessionProvider creates the worker + owns MediaRecorder.
            Must be inside Redux Provider (reads/writes isRecording). */}
        <SessionProvider>
          <Toaster position="bottom-center" />
          <AppBar />
          <div>
            <Class />
          </div>
        </SessionProvider>
      </Provider>
    </div>
  );
};

export default ClassRoom;