import { ADMIN_BANNER } from "@/data/roles";

export function AdminBanner() {
  return (
    <div className="overflow-hidden rounded-[14px] bg-gradient-to-br from-navy-900 to-blue-800 p-6 sm:p-8 lg:p-10">
      <div className="grid items-center gap-6 sm:gap-8 lg:grid-cols-[1fr_auto]">
        <div>
          <span className="mb-2.5 block text-[11px] font-bold uppercase tracking-widest text-white/45">
            {ADMIN_BANNER.label}
          </span>
          <h3 className="mb-3 font-serif text-[clamp(18px,2.5vw,28px)] leading-[1.3] text-white">
            {ADMIN_BANNER.title}
          </h3>
          <p className="max-w-[600px] text-sm leading-[1.7] text-white/60">
            {ADMIN_BANNER.description}
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-3 sm:min-w-[200px]">
          <div className="rounded-[10px] border border-white/10 bg-white/[0.07] p-3.5 text-center">
            <div className="font-serif text-[28px] font-bold text-white">
              {ADMIN_BANNER.stat}
            </div>
            <div className="mt-0.5 text-[11px] text-white/45">{ADMIN_BANNER.statLabel}</div>
          </div>
          <a
            href="#"
            className="block rounded-lg bg-accent-500 py-3 text-center text-sm font-bold text-navy-900 transition-opacity hover:opacity-90"
          >
            {ADMIN_BANNER.cta}
          </a>
        </div>
      </div>
    </div>
  );
}
