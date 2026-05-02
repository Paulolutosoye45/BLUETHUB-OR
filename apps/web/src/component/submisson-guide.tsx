import { ArrowRight } from 'lucide-react'

const SubmissionGuide = () => {
    return (
        <div className="rounded-2xl bg-chestnut p-5 space-y-3">
            <h3 className="text-white font-bold text-sm">Submission guide</h3>
            <ul className="space-y-2">
                {[
                    "Lessons go through a review process before appearing in the curriculum.",
                    "Once approved, students and parents can view them in the portal.",
                ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40 shrink-0 mt-1.5" />
                        <p className="text-white/70 text-xs leading-relaxed">{tip}</p>
                    </li>
                ))}
            </ul>
            <button className="text-xs font-semibold text-student-chestnut hover:opacity-70 transition-opacity flex items-center gap-1">
                Learn more about the process
                <ArrowRight className="w-3 h-3" />
            </button>
        </div>
    )
}

export default SubmissionGuide