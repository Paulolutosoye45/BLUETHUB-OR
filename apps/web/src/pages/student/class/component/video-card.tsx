import { Clock, Signal } from "lucide-react";
import { Button } from "@bluethub/ui-kit";
import Play from '@/assets/svg/play.svg?react'
import { useNavigate } from "react-router-dom";


interface VideoLessonCardProps {
    thumbnail: string;
    title: string;
    description: string;
    date: string;
    duration: string;
    level: string;
}

const VideoLessonCard = ({
    thumbnail,
    title,
    description,
    date,
    duration,
    level,
}: VideoLessonCardProps) => {

    const navigate = useNavigate()
    return (
        <div className="border  hover:bg-[#4F61E81A] border-[#E5E7EB] rounded-[10px] px-5 py-7 shadow-sm bg-white  hover:shadow-md transition-all duration-200 font-Poppins cursor-pointer">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-5  ">
                {/* Thumbnail */}
                <div className="relative w-full md:w-35 h-25 md:h-22.5 rounded-[6px] overflow-hidden">
                    <img
                        src={thumbnail}
                        alt={title}
                        className="w-full h-full object-cover rounded-[6px]"
                    />
                    <span className="absolute bottom-2 right-2 bg-[#000000CC] text-white text-xs font-Poppins px-2 py-0.5 rounded-lg">
                        {duration}
                    </span>
                </div>

                {/* Text Content */}
                <div className="flex-1 space-y-1 capitalize">
                    <h3 className="font-Poppins text-base font-medium text-blck-b2">
                        {title}
                    </h3>
                    <p className="text-blck-b2/80 text-xs font-medium  font-Poppins leading-snug">
                        {description}
                    </p>
                    <p className="text-blck-b2/70 text-[10px] font-medium font-Poppins mt-1">
                        Date: {date}
                    </p>
                </div>

                {/* Action Row */}
            </div>
            <div className="flex items-center justify-end flex-wrap gap-3 mt-3 md:mt-0 md:ml-auto">
                <div className="flex items-center text-blck-b2/75 text-sm  font-medium font-Poppins gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{duration}</span>
                </div>

                <div className="flex items-center text-[#FFCD29] text-sm  font-medium font-Poppins gap-1">
                    <Signal className="w-4 h-4" />
                    <span className="text-blck-b2/75">{level}</span>
                </div>

                <Button onClick={() => navigate('4/watch')} className="bg-student-chestnut hover:bg-[#4052D6] text-white font-Poppins font-semibold text-sm px-4 py-2 rounded-md">
                    <Play className="text-white" /> <span >Watch</span>
                </Button>

                <Button
                    variant="outline"
                    className="text-student-chestnut font-medium  border border-student-chestnut/30 bg-[#F3F4FF] hover:bg-[#E8EAFF] font-Poppins text-sm px-4 py-2 rounded-md"
                >
                    Files
                </Button>
            </div>
        </div>
    );
};

export default VideoLessonCard;
