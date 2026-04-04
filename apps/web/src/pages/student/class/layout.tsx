import StudentAppBar from "../component/app-bar";
import ClassView from "./class-view";
import SelectSubject from "./component/select-subject";
import SelectTopic from "./component/select-topic";


const ClassLayout = () => {
  return (
    <div
      className="px-7 h-screen transition-all duration-300 border-none 
      overflow-y-auto 
      [&::-webkit-scrollbar]:w-1
      [&::-webkit-scrollbar]:h-2.5 
      [&::-webkit-scrollbar-track]:rounded-full
      [&::-webkit-scrollbar-track]:bg-gray-100
      [&::-webkit-scrollbar-thumb]:rounded-full
      [&::-webkit-scrollbar-thumb]:bg-gray-400
      dark:[&::-webkit-scrollbar-track]:bg-neutral-700
      dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
    >
      {/* App Bar */}
      <StudentAppBar />
      {/* Main Layout */}
      <section className="grid grid-cols-1 md:grid-cols-[30%_68%] gap-4 mt-6 justify-center">
        {/* Left Sidebar */}
        <section className="flex flex-col gap-6">
          <SelectSubject />
          <SelectTopic />
        </section>

        {/* Right Content Area */}
        <section className="w-full">
          <ClassView />
        </section>
      </section>
    </div>
  );
};

export default ClassLayout;
