import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Plus, Loader2, Inbox } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@bluethub/ui-kit";
import { teacherService, type AssessmentSubmissionItem } from "@/services/teacher";

const AssessmentSubmissions = () => {
    const [submissions, setSubmissions] = useState<AssessmentSubmissionItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const res = await teacherService.getRecentSubmissions({ limit: 10 });
                if (res.data.isSuccess) {
                    setSubmissions(res.data.data.submissions);
                }
            } catch (err) {
                console.error("Failed to fetch submissions:", err);
                setSubmissions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, []);

    if (loading) {
        return (
            <div className="border border-[#E8E8E3] rounded-2xl bg-white overflow-hidden">
                <div className="border-b border-[#E8E8E3] flex justify-between items-center py-4 px-5">
                    <div>
                        <h2 className="text-[#0F0F0E] font-semibold text-sm">Assessment submissions</h2>
                        <p className="text-[#A8A8A4] font-normal text-xs mt-0.5">
                            Track student responses and submission status
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-chestnut" />
                </div>
            </div>
        );
    }

    return (
        <div className="border border-[#E8E8E3] rounded-2xl bg-white overflow-hidden">
            {/* Header */}
            <div className="border-b border-[#E8E8E3] flex justify-between items-center py-4 px-5">
                <div>
                    <h2 className="text-[#0F0F0E] font-semibold text-sm">Assessment submissions</h2>
                    <p className="text-[#A8A8A4] font-normal text-xs mt-0.5">
                        Track student responses and submission status
                    </p>
                </div>
                <button className="border border-[#E8E8E3] hover:bg-[#EEF1FB] cursor-pointer rounded-lg py-1.5 px-3 text-chestnut font-medium text-sm flex items-center gap-1.5 transition-colors">
                    <Plus className="size-3.5" />
                    New assessment
                </button>
            </div>

            {/* Empty state */}
            {submissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <Inbox className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500">No recent submissions</p>
                </div>
            ) : (
                /* Table */
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent bg-[#F4F4F0]">
                            <TableHead className="text-[10px] font-bold uppercase tracking-wide text-[#A8A8A4] px-5">Student</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-wide text-[#A8A8A4]">Assessment</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-wide text-[#A8A8A4]">Submitted</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-wide text-[#A8A8A4]">Score</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-wide text-[#A8A8A4]">Status</TableHead>
                            <TableHead />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {submissions.map((s) => {
                            const isGraded = s.status === "graded";

                            return (
                                <TableRow key={s.id} className="hover:bg-gray-50/60 transition-colors">
                                    {/* Student */}
                                    <TableCell className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[#EEF1FB] flex items-center justify-center shrink-0 overflow-hidden">
                                                {s.studentAvatar ? (
                                                    <img src={s.studentAvatar} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-chestnut font-semibold text-xs">
                                                        {s.studentName.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[#0F0F0E] font-semibold text-sm leading-tight">{s.studentName}</p>
                                        </div>
                                    </TableCell>

                                    {/* Assessment */}
                                    <TableCell>
                                        <p className="text-[#0F0F0E] font-medium text-xs">{s.assessmentTitle}</p>
                                        <p className="text-[#A8A8A4] text-[11px] mt-0.5">{s.subjectName}</p>
                                    </TableCell>

                                    {/* Submitted date */}
                                    <TableCell className="text-[#0F0F0E] font-medium text-xs">
                                        {format(new Date(s.submittedAt), "dd MMM yyyy")}
                                    </TableCell>

                                    {/* Score */}
                                    <TableCell>
                                        {isGraded && s.score !== undefined && s.maxScore !== undefined ? (
                                            <span className="text-[#0F0F0E] font-semibold text-xs">
                                                {s.score}/{s.maxScore}
                                            </span>
                                        ) : (
                                            <span className="text-[#A8A8A4] text-xs">—</span>
                                        )}
                                    </TableCell>

                                    {/* Status */}
                                    <TableCell>
                                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                                            isGraded
                                                ? "bg-green-50 text-green-600"
                                                : "bg-[#FFF8ED] text-[#7A4D00]"
                                        }`}>
                                            {isGraded ? "Graded" : "Pending"}
                                        </span>
                                    </TableCell>

                                    {/* Action */}
                                    <TableCell>
                                        <button className="border border-[#E8E8E3] hover:border-chestnut/30 hover:text-chestnut text-[#0F0F0E] text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
                                            {isGraded ? "View" : "Grade"}
                                        </button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            )}
        </div>
    )
}

export default AssessmentSubmissions