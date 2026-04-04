import Edit from "@/assets/svg/edit.svg?react";
import { Button } from "@bluethub/ui-kit";
import test_profile from "@/assets/png/test_profile.png";
const Profile = () => {
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
              <button className="absolute bottom-0 right-0 bg-white rounded-full w-7 h-7 flex justify-center items-center border border-gray-300 shadow">
                <Edit className="text-blck-b2" />
              </button>
            </div>
            <div>
              <p className="capitalize text-base font-medium text-gray-800">
                Sarah Johnson
              </p>
              <p className="text-sm text-gray-500 mt-1">ID: 32424662778</p>
            </div>
          </div>
          <button>
            <Edit className="text-blck-b2" />
          </button>
        </div>

        <div className="my-6 space-y-6 w-full">
          <div className="flex items-center justify-between">
            <p className="text-gray-800 font-medium text-base leading-[23.09px]">
              Name
            </p>
            <p className="text-gray-600 font-medium text-base leading-[23.09px]">
              your name
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-gray-800 font-medium text-base leading-[23.09px]">
              Class
            </p>
            <p className="text-gray-600 font-medium text-base leading-[23.09px]">
              Basic 7 love
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-gray-800 font-medium text-base leading-[23.09px]">
              Subject
            </p>
            <p className="text-gray-600 font-medium text-base leading-[23.09px]">
              15 courses
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-gray-800 font-medium text-base leading-[23.09px]">
              Email account
            </p>
            <p className="text-gray-600 font-medium text-base leading-[23.09px]">
              yourname@gmail.com
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
