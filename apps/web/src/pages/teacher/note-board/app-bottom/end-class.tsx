import { Button } from "@bluethub/ui-kit";
import PhoneIcon from "@/assets/svg/phone.svg?react";
import toast from 'react-hot-toast';
import { useDispatch } from "react-redux";
import { pauseCurrentTime } from "@/store/class-action-slice";

const EndClass = () => {
  const dispatch = useDispatch();

  const endClassHanlder = () => {
    dispatch(pauseCurrentTime())
    toast.success('class has ended')
  }
  return (
    <div>
      <Button onClick={endClassHanlder} className="hover:bg- cursor-pointer bg-[#D92D25] drop-shadow-xl rounded-full size-14 flex items-center justify-center">
        <span className="font-Irish-Grover text-white font-normal text-2xl leading-[100%]">
          <PhoneIcon className="size-6" />
        </span>
      </Button>
    </div>
  );
}

export default EndClass