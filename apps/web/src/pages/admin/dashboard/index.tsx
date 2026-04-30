import AdminAppbar from "./app-bar";
import Charts from "./charts";
import SchoolProgress from "./school-progress";

const AdminDashboard = () => {
  return (
    <div
      className="px-6  h-screen transition-all duration-300 border-none 
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
      <AdminAppbar />
      <div>
        <SchoolProgress />
        <Charts />
      </div>
    </div>
  );
}

export default AdminDashboard