import { CircleChevronLeft, Upload, User } from "lucide-react";
import { useRef, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Step1Form {
  schoolName: string;
  schoolLogo: File | null;
  schoolAddress: string;
  country: string;
  state: string;
  city: string;
  branch: string;
}

interface Step2Form {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roleDescription: string;
  username: string;
  secretPhrase: string;
  phraseAnswer: string;
  acknowledged: boolean;
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({
  label, required, optional, hint, children,
}: {
  label: string; required?: boolean; optional?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-normal text-[#6B7280] font-space-grotesk">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
        {optional && <span className="text-gray-400 font-normal ml-1">(optional)</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#4F61E8]/20 focus:border-[#4F61E8] transition";

function Input({
  placeholder, icon, value, onChange, type = "text",
}: {
  placeholder: string; icon?: React.ReactNode; value: string;
  onChange: (v: string) => void; type?: string;
}) {
  return (
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300">{icon}</span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputCls} ${icon ? "pl-9" : ""}`}
      />
    </div>
  );
}

// ── Logo Upload ───────────────────────────────────────────────────────────────
function LogoUpload({ onChange }: { value: File | null; onChange: (f: File | null) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handle = (file: File) => {
    onChange(file);
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div
      onClick={() => ref.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handle(f); }}
      className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#4F61E8] hover:bg-indigo-50/20 transition-all"
    >
      {preview ? (
        <img src={preview} className="h-14 object-contain mb-1" />
      ) : (
        <>
          <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
            <Upload size={16} className="text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-[#4F61E8]">Click to upload logo</p>
          <p className="text-[11px] text-gray-400 mt-0.5">PNG, SVG, JPEG or WEBP · 2MB</p>
        </>
      )}
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) handle(e.target.files[0]); }} />
    </div>
  );
}

// ── Registration Summary Panel ────────────────────────────────────────────────
function RegistrationSummary({ step1, step2 }: { step1: Step1Form; step2: Step2Form }) {
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

// ── Step 1: School Information ────────────────────────────────────────────────
function Step1({
  form, setForm, onNext,
}: {
  form: Step1Form; setForm: React.Dispatch<React.SetStateAction<Step1Form>>; onNext: () => void;
}) {
  const set = (k: keyof Step1Form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  const canNext = form.schoolName.trim() && form.schoolAddress.trim() && form.country.trim() && form.state.trim();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-gray-800 font-space-grotesk">Tell us about your school</h2>
        <p className="text-xs text-[#3A3A3A] mt-1 font-space-grotesk">
          This information will appear on your school's Bleutthub profile and help us set up your account correctly
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-sm font-normal text-[#6B7280] font-space-grotesk">School Identity</p>

        <Field label="School Name" required>
          <Input placeholder="eg GreenWood College" icon={<User size={13} />}
            value={form.schoolName} onChange={set("schoolName")} />
        </Field>

        <Field label="School Logo" optional>
          <LogoUpload value={form.schoolLogo}
            onChange={(f) => setForm((prev) => ({ ...prev, schoolLogo: f }))} />
        </Field>

        <Field label="School address" required>
          <Input placeholder="eg Street address, building name"
            value={form.schoolAddress} onChange={set("schoolAddress")} />
        </Field>
      </div>

      <div className="h-px bg-gray-100" />

      <div className="flex flex-col gap-4">
        <p className="text-sm font-normal text-[#6B7280] font-space-grotesk">Location details</p>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Country" required>
            <Input placeholder="Nigeria" value={form.country} onChange={set("country")} />
          </Field>
          <Field label="State/Province" required>
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
        disabled={!canNext}
        className="w-full bg-[#292382] hover:bg-indigo-900 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-md font-space-grotesk transition-colors text-sm"
      >
        Continue to account setup
      </button>
    </div>
  );
}

// ── Step 2: Admin Credentials ─────────────────────────────────────────────────
function Step2({
  form, setForm, onNext, onBack, schoolName,
}: {
  form: Step2Form; setForm: React.Dispatch<React.SetStateAction<Step2Form>>;
  onNext: () => void; onBack: () => void; schoolName: string;
}) {
  const set = (k: keyof Step2Form) => (v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const canNext =
    form.firstName.trim() && form.lastName.trim() &&
    form.email.trim() && form.username.trim() &&
    form.secretPhrase.trim() && form.phraseAnswer.trim() &&
    form.acknowledged;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-base font-semibold font-space-grotesk text-gray-800">Create admin credentials</h2>
        <p className="text-xs font-space-grotesk text-gray-400 mt-1">
          This account will have full administrative control over your school. You can add other users and roles later from the dashboard.
        </p>
      </div>

      {/* Personal Identity */}
      <div className="flex flex-col gap-4">
        <p className="text-sm font-normal text-[#6B7280] font-space-grotesk">Personal Identity</p>

        <div className="grid grid-cols-2 gap-3">
          <Field label="First Name" required>
            <Input placeholder="eg Amara" value={form.firstName} onChange={set("firstName") as (v: string) => void} />
          </Field>
          <Field label="Last Name" required>
            <Input placeholder="eg Bob" value={form.lastName} onChange={set("lastName") as (v: string) => void} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Email address" required>
            <Input placeholder="eg amarabob@blutthub.com" type="email"
              value={form.email} onChange={set("email") as (v: string) => void} />
          </Field>
          <Field label="Phone" optional>
            <Input placeholder="+234 9000 0000 00" type="tel"
              value={form.phone} onChange={set("phone") as (v: string) => void} />
          </Field>
        </div>

        <Field label="Role description" optional>
          <Input placeholder="eg super admin, head-teacher and principal"
            value={form.roleDescription} onChange={set("roleDescription") as (v: string) => void} />
        </Field>

        <Field label="Username" required>
          <Input placeholder="eg amara.bop" icon={<User size={13} />}
            value={form.username} onChange={set("username") as (v: string) => void} />
        </Field>
      </div>

      <div className="h-px bg-gray-100" />

      {/* School attachment */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-normal text-[#6B7280] font-space-grotesk">School attachment</p>
        <Field label="Attach admin to school" required>
          <Input placeholder={schoolName || "Greenwood College"} icon={<User size={13} />}
            value={schoolName} onChange={() => {}} />
        </Field>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Secret phrase */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-normal text-[#6B7280] font-space-grotesk">Secret phrase &amp; answer</p>
        <p className="text-xs text-gray-400">
          Your secret phrase is used instead of a password to verify your identity. Generate one automatically or write your own — then set a personal answer only you know. Keep both safe.
        </p>

        <div className="border border-indigo-100 bg-indigo-50/40 rounded-xl p-4 flex flex-col gap-3">
          <p className="text-xs font-normal text-[#4F61E8] flex items-center gap-1.5">🔐 Secret phrase &amp; answer</p>

          <Field label="Write your own question" required
            hint="Use a word or phrase that is meaningful to you but hard for others to guess">
            <Input placeholder="e.g. type your Secret Phrase"
              value={form.secretPhrase} onChange={set("secretPhrase") as (v: string) => void} />
          </Field>

          <div className="bg-white border border-gray-100 rounded-xl px-3 py-2.5 text-[11px] text-gray-400 leading-relaxed">
            Think of a question — your answer is your secret phrase.<br />
            If your phrase is "river stones" then your answer could be something different.<br />
            The answer will be shown verbatim to verify you during sign-ins and recovery.
          </div>

          <Field label="Set your phrase answer" required>
            <Input placeholder="Enter your answer"
              value={form.phraseAnswer} onChange={set("phraseAnswer") as (v: string) => void} />
          </Field>
        </div>

        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.acknowledged}
            onChange={(e) => set("acknowledged")(e.target.checked)}
            className="mt-0.5 accent-[#4F61E8]"
          />
          <span className="text-[11px] text-gray-500">
            I have saved my secret phrase &amp; answer<br />
            <span className="text-gray-400">I understand this cannot be recovered if lost</span>
          </span>
        </label>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-5 py-3 flex items-center gap-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <CircleChevronLeft /> Back
        </button>
        <button
          onClick={onNext}
          disabled={!canNext}
          className="flex-1 bg-[#292382] hover:bg-indigo-900 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-md transition-colors text-sm"
        >
          Continue to Approval
        </button>
      </div>
    </div>
  );
}

// ── Step 3: Review & Submit ───────────────────────────────────────────────────
function Step3({ step1, step2, onBack, onSubmit }: {
  step1: Step1Form; step2: Step2Form; onBack: () => void; onSubmit: () => void;
}) {
  const rows = [
    { label: "School Name",   value: step1.schoolName },
    { label: "Address",       value: step1.schoolAddress },
    { label: "Country",       value: step1.country },
    { label: "State",         value: step1.state },
    { label: "Admin Name",    value: `${step2.firstName} ${step2.lastName}` },
    { label: "Admin Email",   value: step2.email },
    { label: "Username",      value: step2.username },
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
            <span className="font-semibold text-gray-700">{value || "—"}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack}
          className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
          ← Back
        </button>
        <button onClick={onSubmit}
          className="flex-1 bg-[#292382] hover:bg-indigo-900 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
          Submit for Approval ✓
        </button>
      </div>
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────
const STEP_LABELS = ["School Information", "School Information", "Review & Submit"];
const STEP_PCT = [0, 37, 80];

function StepProgress({ step }: { step: number }) {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-gray-400 font-space-grotesk">Step {step} of 3 — {STEP_LABELS[step - 1]}</span>
        <span className="text-xs font-semibold text-[#292382] font-space-grotesk">{STEP_PCT[step - 1]}% complete</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#292382] rounded-full transition-all duration-500"
          style={{ width: `${STEP_PCT[step - 1]}%` }}
        />
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function RegisterSchoolPage() {
  const [step, setStep] = useState(2);
  const [step1, setStep1] = useState<Step1Form>({
    schoolName: "", schoolLogo: null, schoolAddress: "",
    country: "Nigeria", state: "", city: "", branch: "",
  });
  const [step2, setStep2] = useState<Step2Form>({
    firstName: "", lastName: "", email: "", phone: "",
    roleDescription: "", username: "", secretPhrase: "",
    phraseAnswer: "", acknowledged: false,
  });

  const handleSubmit = () => {
    alert("School registration submitted for approval!");
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-[#EEEDF9]">
      {/* TopBar */}
      <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400 hover:text-gray-600 cursor-pointer">Dashboard</span>
          <span className="text-gray-300">/</span>
          <span className="font-semibold text-[#292382]">Register School</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input placeholder="Search schools, users..."
              className="pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl w-52 focus:outline-none focus:ring-2 focus:ring-[#4F61E8]/20 focus:border-[#4F61E8] transition placeholder:text-gray-300" />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">SO</div>
        </div>
      </header>

      {/* Content */}
      <div className="flex gap-[10px] pt-[10px] pb-[47px] px-5 items-start ">
        {/* Left — form */}
        <div className="bg-white  w-[643px] rounded-md border border-gray-100 shadow-sm px-7 py-6">
          <StepProgress step={step} />
          {step === 1 && <Step1 form={step1} setForm={setStep1} onNext={() => setStep(2)} />}
          {step === 2 && <Step2 form={step2} setForm={setStep2} schoolName={step1.schoolName}
            onNext={() => setStep(3)} onBack={() => setStep(1)} />}
          {step === 3 && <Step3 step1={step1} step2={step2}
            onBack={() => setStep(2)} onSubmit={handleSubmit} />}
        </div>

        {/* Right — summary + help */}
        <div className="sticky top-2 w-[462px] flex-shrink-0">
          <RegistrationSummary step1={step1} step2={step2} />
        </div>
      </div>
    </div>
  );
}