import schoolProfile from '@/assets/png/School.png'
import { useAuthContext } from '@/contexts/auth-context';

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
  return (
    <div className="w-full mx-auto border-0 bg-white rounded-lg flex h-[89px]  justify-between items-center mt-5 mb-4 py-5  px-7">
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
        <div className=" rounded-full">
          <img src={schoolProfile} alt="" className=" bg-white border-2 border-[#292382] w-[45.79px] h-[45.79px] rounded-full cursor-pointer" />
        </div>
      </section>
    </div>
  );
};

export default AdminAppbar;
