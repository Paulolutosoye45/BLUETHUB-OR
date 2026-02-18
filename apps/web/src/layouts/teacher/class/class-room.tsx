import { Provider } from "react-redux";
import { store } from "@/store/index";
import Class from "@/pages/teacher/note-board/class";
import AppBar from "./component/app-bar";
import { Toaster } from "react-hot-toast";



const ClassRoom = () => {
  return (
   <div className="">
      <Provider store={store}>
         <Toaster position="bottom-center" />
        <AppBar />
        <div>
          <Class />
        </div>
      </Provider>
    </div>
  )
}

export default ClassRoom