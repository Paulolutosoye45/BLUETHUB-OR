

export function SchoolAtAGlance() {
    const glanceData = [
        { label: 'Active classes', value: 18, color: 'text-gray-900' },
        { label: 'Total subjects', value: 42, color: 'text-gray-900' },
        { label: 'Lessons approved', value: 86, color: 'text-green-600' },
        { label: 'Lessons rejected', value: 12, color: 'text-red-500' },
        { label: 'Pending review', value: 5, color: 'text-amber-500' },
    ]
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-sm font-medium text-gray-900 mb-4">School at a glance</p>
            <div className="divide-y divide-gray-100">
                {glanceData.map(({ label, value, color }) => (
                    <div key={label} className="flex justify-between items-center py-2.5">
                        <span className="text-sm text-gray-500">{label}</span>
                        <span className={`text-sm font-semibold ${color}`}>{value}</span>
                    </div>
                ))}
                <div className="flex justify-between items-center py-2.5">
                    <span className="text-sm text-gray-500">Current term</span>
                    <span className="text-sm font-semibold text-gray-900">Second term</span>
                </div>
            </div>
        </div>
    )
}