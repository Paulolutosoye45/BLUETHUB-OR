import { Button } from "@bluethub/ui-kit";
import { ArrowLeft, ChevronRight, EllipsisVertical } from "lucide-react";
import { Link } from "react-router-dom";

interface TitleBarProps {
    title: string;
    type?: "normal" | "edit";
    buttonName?: string;
    hasArrowIcons?: boolean;
    hasBackIcons?: boolean;
    hasVertical?: boolean;
    linkBtn?: string
    linkBtnLink?: string
    onBack?: () => void;
    onAction?: () => void;
}

const TitleBar = ({
    title,
    type = "normal",
    buttonName,
    hasArrowIcons,
    hasBackIcons,
    hasVertical,
    onBack,
    onAction,
    linkBtn,
    linkBtnLink,
}: TitleBarProps) => {
    const isEdit = type === "normal";

    const bgClass = isEdit
        ? "bg-gradient-to-r from-chestnut to-chestnut/90"
        : "bg-[#EC1B2C]";

    const btnBgClass = isEdit
        ? "bg-gradient-to-r from-chestnut to-chestnut/90 hover:from-chestnut/90 hover:to-chestnut/80"
        : "bg-[#EC1B2C] hover:bg-[#EC1B2C]/90";

    return (
        <div className={`${bgClass} px-6 py-5 rounded-t-lg flex items-center justify-between`}>

            {/* Left side — back arrow + title + chevron */}
            <div className={`flex items-center ${hasBackIcons ? "gap-2.5" : ""}`}>
                {hasBackIcons && (
                    <button
                        onClick={onBack}
                        className="text-white hover:text-white transition-colors"
                    >
                        <ArrowLeft size={18} />
                    </button>
                )}
                <h2 className="font-semibold font-poppins text-lg text-white leading-none">
                    {title}
                </h2>
                {hasArrowIcons && (
                    <ChevronRight size={18} className="text-white/70 ml-1" />
                )}
            </div>

            {/* Right side — action button + kebab menu */}
            <div className="flex items-center gap-2.5">
                {buttonName && (
                    <Button
                        variant="outline"
                        onClick={onAction}
                        className={`${btnBgClass} text-white border-white/20 px-6 py-2.5
                        font-semibold text-sm rounded-md hover:text-white
                        cursor-pointer transition-all duration-300`}
                    >
                        {buttonName}
                    </Button>
                )}

                {linkBtn && linkBtnLink && (
                    <Link 
                         to={linkBtnLink}
                        className={`bg-[#EC1B2C] hover:bg-[#EC1B2C]/90 text-white border-white/20 px-6 py-2.5
                        font-semibold text-sm rounded-md hover:text-white
                        cursor-pointer transition-all duration-300`}
                    >
                        {linkBtn}
                    </Link>
                )}
                {hasVertical && (
                    <button className="text-white/80 hover:text-white transition-colors p-1 rounded">
                        <EllipsisVertical size={18} />
                    </button>
                )}
            </div>

        </div>
    );
};

export default TitleBar;