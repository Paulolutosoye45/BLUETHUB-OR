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

import ShapesIcon from "@/assets/svg/shapes-sharp.svg?react";
import Circle from "@/assets/svg/Circle.svg?react";
import Triangle from "@/assets/svg/Triangle.svg?react";
import Rectangle from "@/assets/svg/Rectangle.svg?react";
import Line from "@/assets/svg/Line.svg?react";
import Arrow from "@/assets/svg/Arrow.svg?react";
import Red_cancel from "@/assets/svg/red-cancel.svg?react";
import { onSetAction } from "@/store/class-action-slice";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";

const Shapes = () => {
    const dispatch = useDispatch();
    const actionSelect = useSelector((state: RootState) => state.action.value);

    const allShapes = [
        {
            shapeName: "circle",
            shapeIcon: <Circle />,
        },
        {
            shapeName: "triangle",
            shapeIcon: <Triangle />,
        },
        {
            shapeName: "rectangle",
            shapeIcon: <Rectangle />,
        },
        {
            shapeName: "line",
            shapeIcon: <Line />,
        },
        {
            shapeName: "arrow",
            shapeIcon: <Arrow />,
        },
    ];

    const isShapeSelected = allShapes.some(
        (shape) => shape.shapeName.toLowerCase() === actionSelect?.toLowerCase()
    );

    return (
        <div className={` font-poppins flex items-center justify-center py-2 cursor-pointer hover:bg-forestBlue ${isShapeSelected ? "bg-forestBlue " : ""}`}>
            <Popover>
                <PopoverTrigger asChild>
                    <div className="bg-none">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className=' hover:bg-transparent cursor-pointer'
                                >
                                    <ShapesIcon
                                        className='size-4 text-forestBlue-light'
                                    />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right" align="center">
                                <p>shapes</p>
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
                            <h4 className="leading-none font-medium text-base text-forestBlue-light  ">
                                Shapes
                            </h4>
                            <PopoverClose>
                                <Red_cancel />
                            </PopoverClose>
                        </div>

                        <div className="bg-[#E2E8E6] w-[90%] mx-auto p-px"></div>
                        <div className="flex items-center justify-between p-2 gap-2.5 py-7">
                            {allShapes.map((shape, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col items-center justify-center cursor-pointer flex-1"
                                >
                                    <div
                                        className={`mb-2 p-2 bg-[#4F61E814]  text-forestBlue-light rounded-full size-9 flex items-center justify-center hover:bg-[#4F61E820] transition-colors 
                        ${actionSelect === shape.shapeName.toLowerCase()
                                                ? "bg-forestBlue-light hover:bg-forestBlue-light text-white"
                                                : ""
                                            } `}
                                        onClick={() =>
                                            dispatch(onSetAction(shape.shapeName.toLowerCase()))
                                        }
                                    >
                                        {shape.shapeIcon}
                                    </div>
                                    <h4 className="leading-none font-medium text-xs text-forestBlue-light font-poppins text-center capitalize">
                                        {shape.shapeName}
                                    </h4>
                                </div>
                            ))}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default Shapes;
