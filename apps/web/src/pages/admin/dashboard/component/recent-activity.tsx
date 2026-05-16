export function RecentActivity() {
    const activityData = [
        { label: 'Amara Okonkwo registered as student', time: 'Today, 8:40am', dot: 'bg-green-500' },
        { label: 'Lesson submitted — Mrs. Adaeze Okafor', time: 'Today, 9:14am', dot: 'bg-amber-500' },
        { label: 'Lesson rejected — revision needed', time: 'Yesterday, 10:45am', dot: 'bg-red-500' },
        { label: 'Mr. Emeka registered as teacher', time: 'Yesterday, 2:30pm', dot: 'bg-green-500' },
    ]
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-sm font-medium text-gray-900 mb-4">Recent activity</p>
            <div className="divide-y divide-gray-100">
                {activityData.map(({ label, time, dot }, i) => (
                    <div key={i} className="flex items-start gap-3 py-2.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${dot} mt-1 shrink-0`} />
                        <div>
                            <p className="text-sm font-medium text-gray-800">{label}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}