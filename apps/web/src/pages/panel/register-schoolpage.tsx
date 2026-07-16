import { useState } from "react";
import RegistrationSummary from "./component/registration-summary";
import StepOne from "./component/step-one";
import StepTwo from "./component/step-two";
import StepThree from "./component/step-three";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Step1Form {
  schoolName: string;
  schoolLogo: File | null;
  schoolAddress: string;
  country: string;
  state: string;
  city: string;
  branch: string;
}

export interface Step2Form {
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

const STEP_LABELS = ["School Information", "Admin Credentials", "Review & Submit"];
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
  const [step, setStep] = useState(1);
  const [step1, setStep1] = useState<Step1Form>({
    schoolName: "", schoolLogo: null, schoolAddress: "",
    country: "", state: "", city: "", branch: "",
  });
  const [step2, setStep2] = useState<Step2Form>({
    firstName: "", lastName: "", email: "", phone: "",
    roleDescription: "", username: "", secretPhrase: "",
    phraseAnswer: "", acknowledged: false,
  });

  const handleStep1Next = (data: Step1Form) => {
    setStep1(data);
    setStep(2);
  };

  const handleStep2Next = (data: Step2Form) => {
    setStep2(data);
    setStep(3);
  };

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
          {step === 1 && <StepOne form={step1} onNext={handleStep1Next} />}
          {step === 2 && <StepTwo form={step2} schoolName={step1.schoolName}
            onNext={handleStep2Next} onBack={() => setStep(1)} />}
          {step === 3 && <StepThree step1={step1} step2={step2}
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
