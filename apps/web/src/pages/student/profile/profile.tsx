import { Button } from "@bluethub/ui-kit";
import test_profile from "@/assets/png/test_profile.png";
import { useAuthContext, isStudentRoleData } from "@/contexts/auth-context";
import StudentQrCard from "./student-qr-card";

const Profile = () => {
  const { user } = useAuthContext();

  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Student";
  const emailAddress = user?.emailAddress ?? "";
  const className = (() => {
    const rd = user?.roleData;
    if (rd && isStudentRoleData(rd)) return rd.classroom?.className ?? "";
    return "";
  })();
  const totalSubjects = (() => {
    const rd = user?.roleData;
    if (rd && isStudentRoleData(rd)) return rd.totalSubjects ?? 0;
    return 0;
  })();

  return (
    <div className="lg:px-4 lg:py-6 mb-10 lg:mb-0">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-lg font-semibold text-gray-800">Personal Data </h2>
      </div>
      <div className="flex flex-col items-start lg:gap-4 px-4">
        <div className="flex items-center justify-between w-full pb-3 border-b border-gray-200">
          <div className="flex items-center pt-3 lg:pt-0 gap-3">
            <div className="relative">
              <div className="w-16 h-16 overflow-hidden rounded-full">
                <img
                  src={test_profile}
                  alt="Profile"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
            <div>
              <p className="capitalize text-base font-medium text-gray-800">
                {fullName}
              </p>
            </div>
          </div>
        </div>

        <div className="my-6 w-full">
          <StudentQrCard />
        </div>

        <div className="space-y-4 w-full">
          <div className="flex items-center justify-between">
            <p className="text-gray-800 font-medium text-base">
              Name
            </p>
            <p className="text-gray-600 font-medium text-base">
              {fullName}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-gray-800 font-medium text-base">
              Class
            </p>
            <p className="text-gray-600 font-medium text-base">
              {className || "—"}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-gray-800 font-medium text-base">
              Subject
            </p>
            <p className="text-gray-600 font-medium text-base">
              {totalSubjects > 0 ? `${totalSubjects} courses` : "—"}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-gray-800 font-medium text-base">
              Email account
            </p>
            <p className="text-gray-600 font-medium text-base">
              {emailAddress || "No email address"}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-gray-800 font-medium text-base">
              Mobile number
            </p>
            <p className="text-gray-600 font-medium text-base">
              Add number
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-gray-800 font-medium text-base">
              Location
            </p>
            <p className="text-gray-600 font-medium text-base">
              Lagos Nigeria
            </p>
          </div>

          <Button
            type="submit"
            variant="outline"
            className="bg-student-chestnut text-white border border-[#E4E4E4EE] px-4 py-2 font-medium text-sm rounded-md cursor-pointer hover:bg-[#3A4FE8] hover:text-white w-full"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
