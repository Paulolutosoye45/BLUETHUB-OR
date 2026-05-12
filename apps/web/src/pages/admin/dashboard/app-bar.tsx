import schoolProfileImg from '@/assets/png/School.png'
import { useAuthContext } from '@/contexts/auth-context';
import type { SchoolInfo } from '@/services';
import { localData } from '@/utils';
import { Menu } from 'lucide-react';

const AdminAppbar = () => {
  const { user } = useAuthContext();
  const today = new Date();

  const dayName = today.toLocaleDateString("en-US", {
    weekday: "long",
  });

  const formattedDate = today.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const schoolProfile = localData.retrieve("schoolInfo") as SchoolInfo | null;
  return (
    <>
      <div className=" hidden w-full mx-auto border-0 bg-white rounded-lg md:flex h-[89px]  justify-between items-center  py-5  px-7">
        <section>
          <h2 className="font-poppins font-medium text-[15px] leading-tight text-chestnut ">
            Hello, <span className="font-semibold capitalize ">{user?.firstName},</span> Welcome Back!
          </h2>
        </section>
        <section className="flex justify-between gap-4 items-center">
          <h2 className="font-semibold text-base leading-tight text-chestnut">
            {dayName},
            <span className="font-medium text-sm">
              {formattedDate}
            </span>
          </h2>
          <div className="w-[45.79px] h-[45.79px]  rounded-full">
            <img src={schoolProfile?.logoUrl} alt="" className=" bg-white border-2 border-chestnut  rounded-full  w-full h-full cursor-pointer" />
          </div>
        </section>
      </div>

      <div className='py-2.5 px-4 my-4 rounded-[10px]  bg-white md:hidden'>
        <div className='flex items-center justify-between'>
          <Menu  className="size-6 text-chestnut" />

          <div className='flex items-center justify-between gap-2'>
            <div className='w-10 h-10 rounded-full '>
              <img src={schoolProfileImg} className='w-full h-full object-cover' alt="school logo" />
            </div>
              <div>
                 <h2 className='text-chestnut font-semibold text-sm'>Greenfieldcollege</h2>
                <p className='text-[#29238280] font-semibold text-xs'>Admin </p>
              </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminAppbar;
