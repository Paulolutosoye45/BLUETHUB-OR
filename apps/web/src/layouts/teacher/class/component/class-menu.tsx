import Media from "@/pages/teacher/note-board/class-menu/media";
import Paint from "@/pages/teacher/note-board/class-menu/paint";
import Pen from "@/pages/teacher/note-board/class-menu/pen";
import Select from "@/pages/teacher/note-board/class-menu/select";
import Shapes from "@/pages/teacher/note-board/class-menu/shapes";
import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@bluethub/ui-kit";
import ArrowBack from "@/assets/svg/arrow-back.svg?react";
import ArrowBackRight from "@/assets/svg/arrow-back-right.svg?react";
import { useState } from "react";
// import { TooltipProvider } from "../../../../../../../packages/ui/src/components/ui/tooltip"
// import { TooltipProvider } from ""


const ClassMenu = () => {
  const [closedNav, setClosedNav] = useState<boolean>(false);

  const toggleNav = () => {
    setClosedNav(!closedNav);
  };
  return (
    <div className="font-poppins px-3 ">
      <div className="flex  flex-col items-center justify-between max-h-screen  space-y-2">
        {/* close-nav */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={"ghost"}
                onClick={toggleNav}
                className="hover:bg-transparent"
              >
                {!closedNav ? (
                  <ArrowBack className="size-6" />
                ) : (
                  <ArrowBackRight className="size-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" align="center">
              <p className="font-poppins">
                {!closedNav ? "close " : "open"} menu
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div
          className={`w-17.5  overflow-hidden rounded-2xl shadow-md ${closedNav ? "hidden" : "block"
            }`}
        >
          <Select />
          <Pen />
          <Media />
          <Shapes />
          <Paint />
        </div>
      </div>
    </div>
  )
}

export default ClassMenu