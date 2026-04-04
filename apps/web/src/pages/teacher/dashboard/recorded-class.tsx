import RecordedTable from "@/shared/recorded-table";



const Recordedclass = () => {
    const classes = [
        { title: "Algebra I - Quadratic Functions", views: 145 },
        { title: "Algebra II - Linear Equation", views: 145 },
        { title: "Algebra II - Linear Equation", views: 145 },
        { title: "Algebra II - Linear Equation", views: 145 },
    ];

    return (
        <RecordedTable
            title="Recorded Class"
            headers={["Class Title", "Views", ""]}
            data={classes}
            showEye
            showDetails
        />

    );
};

export default Recordedclass;
