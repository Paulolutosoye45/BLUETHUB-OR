import { ChevronLeft } from "lucide-react";
import type { Step1Form, Step2Form } from "../register-schoolpage";

const StepThree = ({ step1, step2, onBack, onSubmit }: {
  step1: Step1Form; step2: Step2Form; onBack: () => void; onSubmit: () => void;
}) => {
  const rows = [
    { label: "School Name",   value: step1.schoolName },
    { label: "Address",       value: step1.schoolAddress },
    { label: "Country",       value: step1.country },
    { label: "State",         value: step1.state },
    { label: "City",          value: step1.city },
    { label: "Branch",        value: step1.branch },
    { label: "School Logo",   value: step1.schoolLogo ? step1.schoolLogo.name : null },
    { label: "Admin Name",    value: `${step2.firstName} ${step2.lastName}` },
    { label: "Admin Email",   value: step2.email },
    { label: "Phone",         value: step2.phone },
    { label: "Username",      value: step2.username },
    { label: "Role",          value: step2.roleDescription },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Review &amp; Submit</h2>
        <p className="text-xs text-gray-400 mt-1">Confirm all details before submitting for approval.</p>
      </div>

      <div className="border border-gray-100 rounded-2xl overflow-hidden">
        {rows.map(({ label, value }, i) => (
          <div key={label} className={`flex justify-between px-4 py-3 text-sm ${i !== rows.length - 1 ? "border-b border-gray-50" : ""}`}>
            <span className="text-gray-400">{label}</span>
            <span className="font-semibold text-gray-700 text-right max-w-[60%] truncate">{value || "—"}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack}
          className="px-5 py-3 rounded-md flex border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
          <ChevronLeft /> Back
        </button>
        <button onClick={onSubmit}
          className="flex-1 bg-[#292382] hover:bg-indigo-900 text-white font-semibold py-3 rounded-md transition-colors text-sm">
          Submit for Approval
        </button>
      </div>
    </div>
  );
}

export default StepThree;
