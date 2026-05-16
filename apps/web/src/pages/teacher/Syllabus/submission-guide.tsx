
const SubmissionGuide = () => {
    return (
        <div className="rounded-2xl bg-chestnut p-5 space-y-3">
            <h3 className="text-white font-bold text-sm">Submission guide</h3>
            <ul className="space-y-2">
                {[
                    "Align topics with the NERDC Scheme of Work for faster approval",
                    "Include assessment type per week — e.g. quiz, classwork, test",
                    "Admin reviews within 1-3 working days",
                ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40 shrink-0 mt-1.5" />
                        <p className="text-white/70 text-xs leading-relaxed">{tip}</p>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default SubmissionGuide