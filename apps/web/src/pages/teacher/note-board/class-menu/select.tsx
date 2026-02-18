import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@bluethub/ui-kit";

import Move from "@/assets/svg/solid_move.svg?react";

// import Eraser from "@/assets/svgs/eraser-bold.svg?react";

import { useDispatch, useSelector } from "react-redux";
import { onSetAction } from "@/store/class-action-slice";
import type { RootState } from "@/store";

const Select = () => {
  const dispatch = useDispatch();
  const actionSelect = useSelector((state: RootState) => state.action.value);

  return (
    <div className={`flex items-center justify-center py-2 cursor-pointer hover:bg-forestBlue ${actionSelect == 'SELECT' ? "bg-forestBlue " : ""}`}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => dispatch(onSetAction("SELECT"))}
            variant="ghost"
             className="hover:bg-transparent cursor-pointer"
             
          >
            <Move
              className={`size-6  cursor-pointer ${
                actionSelect == 'select' ? "text-white" : ""
              } `}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" align="center">
          <p>select</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default Select;
