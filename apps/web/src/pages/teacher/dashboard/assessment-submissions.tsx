import { Plus } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@bluethub/ui-kit";

const AssessmentSubmissions = () => {

    const assessments = [
        { title: "Mid-term test", type: "Test", subject: "Basic Science", class: "JSS 2A", dueDate: "18 Apr 2026", submitted: 24, total: 30, status: "Active" },
        { title: "Comprehension quiz", type: "Test", subject: "Basic Science", class: "JSS 2A", dueDate: "18 Apr 2026", submitted: 24, total: 30, status: "Active" },
        { title: "Ecology assignment", type: "Assignment", subject: "Biology", class: "SSS 1A", dueDate: "20 Apr 2026", submitted: 24, total: 30, status: "Active" },
        { title: "Matter & states quiz", type: "Quiz", subject: "Basic Science", class: "JSS 2A", dueDate: "20 Apr 2026", submitted: 0, total: 30, status: "Active" },
        { title: "Matter & states quiz", type: "Quiz", subject: "Basic Science", class: "JSS 2A", dueDate: "20 Apr 2026", submitted: 0, total: 30, status: "Active" },
    ];

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

            {/* Table */}
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent bg-[#F4F4F0]">
                        <TableHead className="text-[10px] font-bold uppercase tracking-wide text-[#A8A8A4] px-5">Assessment</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-wide text-[#A8A8A4]">Class</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-wide text-[#A8A8A4]">Due Date</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-wide text-[#A8A8A4]">Submissions</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-wide text-[#A8A8A4]">Status</TableHead>
                        <TableHead />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {assessments.map((a, i) => {
                        const progress = Math.round((a.submitted / a.total) * 100);
                        const isComplete = progress === 100;
                        const hasProgress = a.submitted > 0;

                        return (
                            <TableRow key={i} className="hover:bg-gray-50/60 transition-colors">
                                {/* Assessment */}
                                <TableCell className="px-5 py-3">
                                    <p className="text-[#0F0F0E] font-semibold text-sm leading-tight">{a.title}</p>
                                    <p className="text-[#A8A8A4] text-[11px] mt-0.5">{a.type} · {a.subject}</p>
                                </TableCell>

                                {/* Class */}
                                <TableCell className="text-[#0F0F0E] font-medium text-xs">{a.class}</TableCell>

                                {/* Due date */}
                                <TableCell className="text-[#0F0F0E] font-medium text-xs">{a.dueDate}</TableCell>

                                {/* Submissions + progress bar */}
                                <TableCell>
                                    <div className="space-y-1.5 min-w-[120px]">
                                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${isComplete ? "bg-green-500" : hasProgress ? "bg-green-400" : "bg-gray-200"
                                                    }`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <p className="text-[#A8A8A4] text-[11px]">
                                            {String(a.submitted).padStart(2, "0")}/{a.total} submitted
                                        </p>
                                    </div>
                                </TableCell>

                                {/* Status */}
                                <TableCell>
                                    <span className="bg-green-50 text-green-600 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                                        {a.status}
                                    </span>
                                </TableCell>

                                {/* Action */}
                                <TableCell>
                                    <button className="border border-[#E8E8E3] hover:border-chestnut/30 hover:text-chestnut text-[#0F0F0E] text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
                                        Update
                                    </button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    )
}

export default AssessmentSubmissions