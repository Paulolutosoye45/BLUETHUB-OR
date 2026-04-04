// BluehubLogin.tsx
import chalkboardImg from '@/assets/jpeg/chalkboardImg.jpg'
import { Outlet } from 'react-router-dom';


export const BluehubLogin = () => {
  return (
    <div
      className="min-h-screen bg-chestnut p-2 flex items-center justify-center lg:block lg:p-4 font-poppins">
      {/* Card */}
      <div className="bg-white rounded-2xl s overflow-hidden flex justify-between w-full  lg:min-h-[90vh]">

        {/* Left — Image */}
        <div className="hidden md:block w-[45%] shrink-0">
          <img
            src={chalkboardImg}
            alt="Bluehub chalkboard"
            className="w-full h-full object-cover rounded-l-2xl"
          />
        </div>

        {/* Right — Form */}
        <div className="flex-1 px-4  lg:px-10 pt-7">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default BluehubLogin;