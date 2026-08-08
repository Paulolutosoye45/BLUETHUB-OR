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
    <div>
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-800">Personal Data </h2>
      </div>
      <div className="flex flex-col justify-center items-center px-8 py-6">
        <div className="my-6 flex items-center justify-between w-full pb-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 overflow-hidden rounded-full">
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

        <div className="my-6 space-y-6 w-full">
          <div className="flex items-center justify-between">
            <p className="text-gray-800 font-medium text-base leading-[23.09px]">
              Name
            </p>
            <p className="text-gray-600 font-medium text-base leading-[23.09px]">
              {fullName}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-gray-800 font-medium text-base leading-[23.09px]">
              Class
            </p>
            <p className="text-gray-600 font-medium text-base leading-[23.09px]">
              {className || "—"}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-gray-800 font-medium text-base leading-[23.09px]">
              Subject
            </p>
            <p className="text-gray-600 font-medium text-base leading-[23.09px]">
              {totalSubjects > 0 ? `${totalSubjects} courses` : "—"}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-gray-800 font-medium text-base leading-[23.09px]">
              Email account
            </p>
            <p className="text-gray-600 font-medium text-base leading-[23.09px]">
              {emailAddress || "No email address"}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-gray-800 font-medium text-base leading-[23.09px]">
              Mobile number
            </p>
            <p className="text-gray-600 font-medium text-base leading-[23.09px]">
              Add number
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-gray-800 font-medium text-base leading-[23.09px]">
              Location
            </p>
            <p className="text-gray-600 font-medium text-base leading-[23.09px]">
              Lagos Nigeria
            </p>
          </div>

          <Button
            type="submit"
            variant="outline"
            className="bg-student-chestnut mt-2 text-white border border-[#E4E4E4EE] px-4 py-2 w-full font-medium text-sm rounded-md cursor-pointer hover:bg-[#3A4FE8] hover:text-white"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
