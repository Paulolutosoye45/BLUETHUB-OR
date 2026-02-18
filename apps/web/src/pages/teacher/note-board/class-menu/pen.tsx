import {
    Button,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    Popover,
    PopoverContent,
    PopoverTrigger,
    PopoverClose
} from "@bluethub/ui-kit";


import PenIcon from "@/assets/svg/pen.svg?react";


// import Sketch from "@/assets/svgs/sketch.svg?react";
import Pil from "@/assets/svg/pil.svg?react";
import Red_cancel from "@/assets/svg/red-cancel.svg?react";
import { useDispatch, useSelector } from "react-redux";
import { onSetAction } from "@/store/class-action-slice";
import type { RootState } from "@/store";

function Pen() {
    const dispatch = useDispatch();
    const actionSelect = useSelector((state: RootState) => state.action.value);
    const toolList = [
        {
            toolName: "Pen",
            toolIcon: <PenIcon />,
        },
        {
            toolName: "eraser",
            toolIcon: <Pil />,
        },
    ];

    const isToolSelected = toolList.some(
        (tool) => tool.toolName.toLowerCase() === actionSelect?.toLowerCase()
    );
    const Eraser = actionSelect == 'eraser'

    return (
        <div className={`flex items-center justify-center py-2 cursor-pointer hover:bg-forestBlue ${isToolSelected ? "bg-forestBlue " : ""}`}>
            <Tooltip></Tooltip>
            <Popover>
                <PopoverTrigger asChild>
                    <div className="bg-none">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="hover:bg-transparent cursor-pointer"
                                >
                                    {/* <PenIcon
                    className="size-4 text-forestBlue-light cursor-pointer "
                  /> */}
                                    {Eraser ? <Pil className="size-7 text-forestBlue-light cursor-pointer " /> : <PenIcon
                                        className="size-4 text-forestBlue-light cursor-pointer "
                                    />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right" align="center">
                                <p>draw</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </PopoverTrigger>
                <PopoverContent
                    side="right"
                    className="absolute to-0% px-0 py-0 ml-3.5 w-72 border-0"
                >
                    <div>
                        <div className="flex items-center justify-between p-4">
                            <h4 className="leading-none font-medium text-sm text-forestBlue-light  ">
                                Pen tool
                            </h4>
                            <PopoverClose>
                                <Red_cancel />
                            </PopoverClose>
                        </div>

                        <div className="bg-[#E2E8E6] w-[90%] mx-auto p-px"></div>
                        {toolList.map((tool) => (
                            <div
                                key={tool.toolName}
                                className=" cursor-pointer flex items-center  space-x-4 bg-[#4F61E814] mx-4 my-2 p-3"
                                onClick={() =>
                                    dispatch(onSetAction(tool.toolName.toLowerCase()))
                                }
                            >
                                <>
                                    <div
                                        className={`size-4 text-forestBlue-light ${actionSelect === tool.toolName.toLowerCase()
                                            ? "text-forestBlue-light"
                                            : ""
                                            } `}
                                    >
                                        {tool.toolIcon}
                                    </div>
                                    <h4 className="leading-none font-medium text-sm text-forestBlue-light">
                                        {tool.toolName}
                                    </h4>
                                </>
                            </div>
                        ))}
                        <div className=" cursor-pointer flex items-center space-x-4  m-3  p-3">
                            {/* <Sketch />
              <h4 className="leading-none font-medium  font-poppins text-[13.7px] text-chestnut">
                Sketch
              </h4> */}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}

export default Pen;
