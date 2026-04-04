import RecordedTable from "@/shared/recorded-table";

const Assignment = () => {

    const classes = [
        { dueDate: "OCT 22, 2025", submissions: "32/36", score: "84%" },
        { dueDate: "Algebra II - Linear Equation", submissions: "32/36", score: "85%" },
        { dueDate: "Algebra II - Linear Equation", submissions: "18/28", score: "86%" },
    ];

    return (
        <RecordedTable
            title="Assignments"
            headers={["Due Date", "Submissions", "Average Score"]}
            data={classes}
            showScore
        />

    )
}

export default Assignment