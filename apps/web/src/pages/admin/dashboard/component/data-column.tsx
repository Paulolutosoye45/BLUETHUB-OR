import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@bluethub/ui-kit";

function DataColunm() {
  const tableData = [
    {
      id: "#232",
      class: "JSS1",
      attendance: "99.00%",
      performance: "100%",
      remark: "Good",
    },
    {
      id: "#233",
      class: "JSS2",
      attendance: "97.50%",
      performance: "89%",
      remark: "Very Good",
    },
    {
      id: "#234",
      class: "JSS3",
      attendance: "85.00%",
      performance: "92%",
      remark: "Excellent",
    },
  ];

  return (
    <div className="relative w-[70%] mb-4">
      <h1 className="font-poppins font-medium text-base leading-[130%] text-[#292382] mx-2 my-4">
        Students List
      </h1>
      <Table>
        <TableHeader className="[&_tr]:border-b-0">
          <TableRow>
            <TableHead className="font-poppins text-[#292382BF]">ID</TableHead>
            <TableHead className="font-poppins text-[#292382BF]">Class</TableHead>
            <TableHead className="font-poppins text-[#292382BF]">Attendance</TableHead>
            <TableHead className="font-poppins text-[#292382BF]">Performance</TableHead>
            <TableHead className="font-poppins text-[#292382BF]">Remark</TableHead>
          </TableRow>
        </TableHeader>


        <TableBody>
          {tableData.map((row, index) => (
            <TableRow key={index} className="border-0">
              <TableCell className="font-poppins font-medium text-[17.03px] text-[#292382BF] py-4">
                {row.id}
              </TableCell>
              <TableCell className="font-poppins font-medium text-[17.03px] text-[#292382BF] py-4">
                {row.class}
              </TableCell>
              <TableCell className="font-poppins font-medium text-[17.03px] text-[#292382BF] py-4">
                {row.attendance}
              </TableCell>
              <TableCell className="font-poppins font-medium text-[17.03px] text-[#292382BF] py-4">
                {row.performance}
              </TableCell>
              <TableCell className="font-poppins font-medium text-[17.03px] text-[#292382BF] py-4">
                {row.remark}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>

      </Table>
    </div>
  );
}

export default DataColunm;
