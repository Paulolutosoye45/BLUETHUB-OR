interface CompletionProps {
    weeksPlanned: number;
    totalWeeks: number;
    totalTopics: number;
    weeksDone: number;
    checks: {
        subjectSelected: boolean;
        titleAdded: boolean;
        atLeast4Weeks: boolean;
        eachWeekHasTopics: boolean;
    };
}

const CircleProgress = ({ percent }: { percent: number }) => {
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;

    return (
        <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 72 72">
                <circle
                    cx="36" cy="36" r={radius}
                    fill="none"
                    stroke="#E8E8E3"
                    strokeWidth="6"
                />
                <circle
                    cx="36" cy="36" r={radius}
                    fill="none"
                    stroke="#292382"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-500"
                />
            </svg>
            <span className="absolute text-xs font-bold text-[#0F0F0E]">{percent}%</span>
        </div>
    );
};

const CheckItem = ({ label, checked }: { label: string; checked: boolean }) => (
    <div className="flex items-center gap-2">
        <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
            checked ? "border-[#292382] bg-[#292382]" : "border-gray-300 bg-white"
        }`}>
            {checked && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            )}
        </div>
        <span className={`text-xs ${checked ? "text-[#0F0F0E]" : "text-[#A0A09C]"}`}>{label}</span>
    </div>
);

const Completion = ({
    weeksPlanned = 0,
    totalWeeks = 12,
    totalTopics = 0,
    weeksDone = 0,
    checks = {
        subjectSelected: false,
        titleAdded: false,
        atLeast4Weeks: false,
        eachWeekHasTopics: false,
    },
}: Partial<CompletionProps>) => {
    const percent = Math.round((weeksPlanned / totalWeeks) * 100);

    return (
        <div className="border border-[#E8E8E3] bg-white rounded-[14px] p-5 space-y-4">
            <h2 className="text-[#3A3A3A] font-semibold text-sm">Completion</h2>

            {/* Circle + weeks */}
            <div className="flex items-center gap-4">
                <CircleProgress percent={percent} />
                <div>
                    <p className="text-[#0F0F0E] font-bold text-base">
                        {weeksPlanned}/{totalWeeks}
                    </p>
                    <p className="text-[#A0A09C] text-xs">weeks planned</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#F4F4F0] rounded-[8px] px-3 py-2.5">
                    <p className="text-[#0F0F0E] font-bold text-base">{totalTopics}</p>
                    <p className="text-[#A0A09C] text-xs">Total topics</p>
                </div>
                <div className="bg-[#F4F4F0] rounded-[8px] px-3 py-2.5">
                    <p className="text-[#0F0F0E] font-bold text-base">{weeksDone}</p>
                    <p className="text-[#A0A09C] text-xs">Weeks done</p>
                </div>
            </div>

            {/* Checklist */}
            <div className="space-y-2.5">
                <p className="text-[#3A3A3A] font-semibold text-xs">Checklist</p>
                <CheckItem label="Subject & class selected" checked={checks.subjectSelected} />
                <CheckItem label="Syllabus title added" checked={checks.titleAdded} />
                <CheckItem label="At least 4 weeks planned" checked={checks.atLeast4Weeks} />
                <CheckItem label="Each week has topics" checked={checks.eachWeekHasTopics} />
            </div>
        </div>
    );
};

export default Completion;