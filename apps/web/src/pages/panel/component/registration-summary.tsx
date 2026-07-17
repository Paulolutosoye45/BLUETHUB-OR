import type { Step1Form, Step2Form } from "../register-schoolpage";

const  RegistrationSummary = ({ step1, step2 }: { step1: Step1Form; step2: Step2Form }) => {
  const isStep2 = !!(step2.firstName || step2.username);

  const rows1 = [
    { label: "School Name", value: step1.schoolName },
    { label: "Branch",      value: step1.branch },
    { label: "Country",     value: step1.country },
    { label: "State",       value: step1.state },
    { label: "Address",     value: step1.schoolAddress },
  ];

  const rows2 = [
    { label: "Names",        value: [step2.firstName, step2.lastName].filter(Boolean).join(" ") },
    { label: "Username",     value: step2.username },
    { label: "Phone",        value: step2.phone ? `+234 ${step2.phone}` : "" },
    { label: "Secret Phrase",value: step2.secretPhrase ? "••••••" : "" },
    { label: "Admin Email",  value: step2.email },
  ];

  const rows = isStep2 ? rows2 : rows1;

  return (
    <div className="flex flex-col gap-3">
      {/* Summary card */}
      <div className="bg-white rounded-md border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-base">🏫</div>
          <h3 className="text-sm font-bold text-gray-700 font-space-grotesk">Registration Summary</h3>
        </div>
        <div className="flex flex-col gap-3">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-space-grotesk">{label}</span>
              <span className={`text-xs font-semibold font-space-grotesk ${value ? "text-gray-700" : "text-gray-300"}`}>
                {value || "- - - - - - - - - -"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Help card */}
      <div className="bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-[#292382] px-4 py-2.5">
          <p className="text-white text-xs font-semibold flex items-center gap-1.5 font-space-grotesk">📌 Need help?</p>
        </div>
        <div className="px-4 py-3">
          <ul className="text-xs text-gray-600 list-disc list-inside space-y-1 mb-2 font-space-grotesk">
            <li className="font-space-grotesk"  >The school will receive login credentials by email once registration is approved. Approval typically takes 1–2 business hours.</li>
          </ul>
          <button className="text-xs text-[#4F61E8] font-semibold hover:underline font-space-grotesk">View Onboarding Guide</button>
        </div>
      </div>
    </div>
  );
}
export default RegistrationSummary