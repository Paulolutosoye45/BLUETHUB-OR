 export const STEPS = [
  { num: 1, label: "School information", sub: "Name, logo, address & location" },
  { num: 2, label: "Account Setup", sub: "Create your admin credentials" },
  { num: 3, label: "Verify & launch", sub: "Confirm details and go live" },
];

// ── Left Panel ────────────────────────────────────────────────────────────────
export default function LeftPanel({ currentStep }: { currentStep: number }) {
    
  return (
    <div className="hidden md:flex flex-col gap-[116px] w-[551px] flex-shrink-0 bg-[linear-gradient(167.24deg,#292382_34.12%,rgba(37,103,218,0.8)_99%)] px-10 py-10 relative overflow-hidden min-h-screen">
      {/* Decorative circles */}
      <div className="absolute top-10 right-0 w-64 h-64 rounded-full bg-white/10 translate-x-20 -translate-y-10" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/10 -translate-x-16" />

      {/* Logo */}
      <div className="flex items-center gap-3 z-10">
        <div className="w-10 h-10 rounded-xl bg-orange-400 flex items-center justify-center text-white font-bold text-lg">B</div>
        <span className="text-white font-bold text-xl tracking-tight">Bluethub</span>
      </div>

      {/* Hero text */}
      <div className="z-10">
        <h1 className="text-white text-4xl font-extrabold leading-tight mb-4">
          Get your school<br />Online in minutes
        </h1>
        <p className="text-white/70 text-sm leading-relaxed mb-10">
          Bleutthub makes it easy to manage teachers,<br />
          students, and school operations — all in one place.
        </p>

        {/* Steps */}
        <div className="flex flex-col gap-0">
          {STEPS.map((step, i) => (
            <div key={step.num}>
              <div className="flex items-start gap-4 py-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 transition-all
                  ${currentStep === step.num
                    ? "bg-white text-[#4338ca]"
                    : currentStep > step.num
                    ? "bg-white/30 text-white"
                    : "bg-white/10 text-white/50"}`}
                >
                  {step.num}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${currentStep >= step.num ? "text-white" : "text-white/40"}`}>
                    {step.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${currentStep >= step.num ? "text-white/60" : "text-white/30"}`}>
                    {step.sub}
                  </p>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className="ml-4 w-px h-4 bg-white/20" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="z-10">
        <p className="text-white/40 text-xs">© 2025 Bleutthub. All rights reserved.</p>
        <p className="text-white/30 text-xs mt-1">
          By registering you agree to our{" "}
          <span className="underline cursor-pointer">Terms of Service</span> and{" "}
          <span className="underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}