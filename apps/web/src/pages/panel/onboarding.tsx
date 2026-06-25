import {  User } from "lucide-react";
import {  useState } from "react";
import LeftPanel, { STEPS } from "./component/left-panel";
import LogoUpload from "./component/logo-upload";
import CreateAdmin from "./component/admin";

interface SchoolInfoForm {
  schoolName: string;
  schoolLogo: File | null;
  schoolAddress: string;
  country: string;
  state: string;
  city: string;
  branch: string;
}







// ── Field ─────────────────────────────────────────────────────────────────────
export function Field({ label, optional, children }: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {!optional && <span className="text-red-400">*</span>}
        {optional && <span className="text-gray-400 font-normal ml-1">(optional)</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ placeholder, icon, value, onChange }: {
  placeholder: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300">
          {icon}
        </span>
      )}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full border border-gray-200 rounded-xl py-3 pr-4 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4F61E8]/30 focus:border-[#4F61E8] transition ${icon ? "pl-9" : "pl-4"}`}
      />
    </div>
  );
}

// ── Step 1 Form ───────────────────────────────────────────────────────────────
function SchoolInformationStep({ onNext }: { onNext: () => void }) {
  const [form, setForm] = useState<SchoolInfoForm>({
    schoolName: "",
    schoolLogo: null,
    schoolAddress: "",
    country: "",
    state: "",
    city: "",
    branch: "",
  });

  const set = (key: keyof SchoolInfoForm) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const canProceed = form.schoolName.trim() && form.schoolAddress.trim() && form.country.trim() && form.state.trim();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Tell us about your school</h2>
        <p className="text-sm text-gray-400 mt-1">
          This information will appear on your school's Bleutthub<br />
          profile and help us set up your account correctly
        </p>
      </div>

      {/* School Identity */}
      <div className="flex flex-col gap-4">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">School Identity</p>

        <Field label="School Name">
          <Input
            placeholder="eg GreenWood College"
            icon={<User size={15} />}
            value={form.schoolName}
            onChange={set("schoolName")}
          />
        </Field>

        <Field label="School Logo" optional>
          <LogoUpload
            value={form.schoolLogo}
            onChange={(file) => setForm((f) => ({ ...f, schoolLogo: file }))}
          />
        </Field>

        <Field label="School address">
          <Input
            placeholder="eg Street address, building name"
            value={form.schoolAddress}
            onChange={set("schoolAddress")}
          />
        </Field>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Location Details */}
      <div className="flex flex-col gap-4">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Location details</p>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Country">
            <Input placeholder="Nigeria" value={form.country} onChange={set("country")} />
          </Field>
          <Field label="State/Province">
            <Input placeholder="eg Lagos / Nairobi" value={form.state} onChange={set("state")} />
          </Field>
        </div>

        <Field label="Location (City / Area)" optional>
          <Input placeholder="eg Victoria Island / Ikeja" value={form.city} onChange={set("city")} />
        </Field>

        <Field label="School branch" optional>
          <Input placeholder="eg Victoria Island / Ikeja" value={form.branch} onChange={set("branch")} />
        </Field>
      </div>

      <button
        onClick={onNext}
        disabled={!canProceed}
        className="w-full bg-[#4338ca] hover:bg-[#3730a3] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl transition-colors text-sm"
      >
        Continue to account setup
      </button>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <LeftPanel currentStep={currentStep} />

      {/* Right panel */}
      <div className="flex-1 flex flex-col">
        {/* Progress bar */}
        <div className="px-10 pt-8 pb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Step {currentStep} of 3 — {STEPS[currentStep - 1].label}</span>
            <span className="text-xs font-semibold text-[#4338ca]">
              {Math.round(((currentStep - 1) / 2) * 100)}% complete
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#4338ca] rounded-full transition-all duration-500"
              style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
            />
          </div>
        </div>

        {/* Form area */}
        <div className="flex-1 overflow-y-auto px-10 py-8 max-w-xl">
          {currentStep === 1 && (
            <SchoolInformationStep onNext={() => setCurrentStep(2)} />
          )}
          {currentStep === 2 && (
            <CreateAdmin onNext={() => setCurrentStep(3)} onPrev={() => setCurrentStep(1)} />
          )}
          {currentStep === 3 && (
            <div className="text-gray-400 text-sm">Verify & Launch — Step 3 (build here)</div>
          )}
        </div>
      </div>
    </div>
  );
}