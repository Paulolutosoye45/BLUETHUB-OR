
import {
    Button,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    PopoverClose,
    ColorPicker,
    ColorPickerAlpha,
    ColorPickerEyeDropper,
    ColorPickerFormat,
    ColorPickerHue,
    ColorPickerOutput,
    ColorPickerSelection,
        Popover,
    PopoverContent,
    PopoverTrigger,
} from "@bluethub/ui-kit";

// import { Slider } from "@/components/ui/slider";
import PaintIcon from "@/assets/svg/paint.svg?react";
// import Eraser from '@/assets/svgs/eraser-bold.svg?react'
// import Sketch from '@/assets/svgs/sketch.svg?react'
import Red_cancel from "@/assets/svg/red-cancel.svg?react";
// import { useState } from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { onSetAction, onSetFillColor } from "@/store/class-action-slice";
import type { RootState } from "@/store";

const Paint = () => {
    const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
    const dispatch = useDispatch();
    const actionSelect = useSelector((state: RootState) => state.action.value);
    // console.log('selectedPreset', selectedPreset)

    useEffect(() => {
        if (selectedPreset !== null) {
            dispatch(onSetFillColor(selectedPreset));
        }
    }, [selectedPreset, dispatch]);

    return (
        <div className={`font-poppins flex items-center justify-center py-2 cursor-pointer hover:bg-forestBlue ${actionSelect == "paint" ? "bg-forestBlue " : ""}`}>
            <Popover>
                <PopoverTrigger asChild>
                    <div className="bg-none">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className='bg-transparent hover:bg-transparent cursor-pointer'
                                    onClick={() => dispatch(onSetAction("paint"))}
                                >
                                    <PaintIcon
                                        className='size-4 text-forestBlue-light'
                                    />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right" align="center">
                                <p>Paint</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </PopoverTrigger>
                <PopoverContent
                    side="right"
                    className="absolute to-0% px-0 py-0 ml-3.5 w-72 border-0"
                >
                    <div>
                        <div className="flex items-center justify-between p-3">
                            <h4 className="leading-none font-medium text-sm text-forestBlue-light  ">
                                Color
                            </h4>
                            <PopoverClose>
                                <Red_cancel />
                            </PopoverClose>
                        </div>
                        <div className="bg-[#E2E8E6] w-[90%] mx-auto p-px"></div>
                        <div className="">
                            {/* <Slider defaultValue={[33]} max={100} step={1} /> */}
                        </div>

                        <ColorPicker className="p-2">
                            <ColorPickerSelection className="w-full h-40" />
                            <div className="flex items-center gap-4">
                                <ColorPickerEyeDropper />
                                <div className="grid w-full gap-1">
                                    <ColorPickerHue className="" />
                                    <ColorPickerAlpha />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <ColorPickerOutput />
                                <ColorPickerFormat setSelectedPreset={setSelectedPreset} />
                            </div>
                        </ColorPicker>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default Paint;
