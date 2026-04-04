import { Button } from "@bluethub/ui-kit";
import { PlusIcon } from "lucide-react";

import RecordedAppbar from "../recorded/recorded-bar";
import ClassInfoList from "./class-info-list";

const ClassInfo = () => {
    const recordings = [
        {
            id: 1,
            subject: "Mathematics",
            date: "Oct 11, 2025",
            status: "Recording started",
        },
        {
            id: 2,
            subject: "Physics",
            date: "Oct 12, 2025",
            status: "Recording paused",
        },
    ]


    return (
        <div className="min-h-screen p-2 space-y-6">
            {/* Top App Bar */}
            <RecordedAppbar />

            {/* Card Container */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-[#E5E5F5]">
                {/* Header */}
                <div className="bg-linear-to-r from-chestnut to-chestnut/90 px-6 py-3 flex justify-between items-center">
                    <h2 className="font-semibold text-white text-lg tracking-wide">
                        Recording Info
                    </h2>

                    <Button
                        variant="outline"
                        className="bg-transparent hover:bg-transparent text-white border-none flex items-center gap-2 font-medium text-sm"
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span>Create new class</span>
                    </Button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div className="border border-[#E5E5F5] rounded-xl bg-white min-h-[70vh]">
                        {/* Section Header */}
                        <div className="border-b border-[#E5E5F5] px-5 py-3">
                            <h3 className="font-semibold text-sm text-chestnut">Details</h3>
                        </div>
                        <ClassInfoList recordings={recordings} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClassInfo;
