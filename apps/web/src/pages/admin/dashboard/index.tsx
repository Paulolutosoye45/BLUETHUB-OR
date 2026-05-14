import AdminAppbar from "./app-bar";
import Charts from "./charts";
import SchoolProgress from "./school-progress";

const AdminDashboard = () => {
  return (
    <div
      className="px-3 sm:px-5 md:px-6 pb-8 h-screen overflow-y-auto bg-gray-50/60
      [&::-webkit-scrollbar]:w-1
      [&::-webkit-scrollbar-track]:rounded-full
      [&::-webkit-scrollbar-track]:bg-gray-100
      [&::-webkit-scrollbar-thumb]:rounded-full
      [&::-webkit-scrollbar-thumb]:bg-gray-300"
    >
      <div className="max-w-[1280px] mx-auto">
        <AdminAppbar />
        <SchoolProgress />
        <Charts />
      </div>
    </div>
  );
}

export default AdminDashboard