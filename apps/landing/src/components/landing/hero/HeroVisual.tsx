import { motion } from "framer-motion";
import { FloatingCard } from "./FloatingCard";

export function HeroVisual() {
  return (
    <motion.div
      className="relative"
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Main mock card */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-surface-white shadow-2xl shadow-blue-600/[0.15] dark:bg-navy-500">
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-400 to-accent-400" />

        <div className="p-5 sm:p-7">
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <span className="text-[13px] font-bold text-navy-900 dark:text-surface-50">
              📚 My Dashboard
            </span>
            <span className="rounded-full bg-emerald-50 px-2.5 py-[3px] text-[10px] font-semibold text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400">
              ● Online
            </span>
          </div>

          {/* Course progress */}
          <div className="mb-3 rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-blue-600">
              Mathematics · Chapter 3
            </div>
            <div className="mb-2.5 text-[13px] font-semibold text-navy-900 dark:text-surface-50">
              Algebra: Quadratic Equations
            </div>
            <div className="h-[5px] overflow-hidden rounded-[3px] bg-blue-100 dark:bg-blue-900/40">
              <motion.div
                className="h-full rounded-[3px] bg-gradient-to-r from-blue-600 to-blue-400"
                initial={{ width: 0 }}
                animate={{ width: "72%" }}
                transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] text-muted">
              <span>72% complete</span>
              <span>8 lessons left</span>
            </div>
          </div>

          {/* Stat cards grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <MockStatCard num="24" label="Questions done" color="text-blue-600" index={0} />
            <MockStatCard num="91%" label="Avg. score" color="text-emerald-500" index={1} />
            <MockStatCard num="5" label="Day streak" color="text-accent-500" index={2} />
            <MockStatCard num="3" label="Offline lessons" color="text-navy-900 dark:text-surface-50" index={3} />
          </div>
        </div>
      </div>

      {/* Floating cards */}
      <FloatingCard
        position="top-right"
        dotColor="bg-emerald-500"
        text="Parent notified ✓"
        className="text-emerald-500"
      />
      <FloatingCard
        position="bottom-left"
        dotColor="bg-blue-600"
        text="Syncing 3 offline videos…"
        className="text-blue-600"
      />
    </motion.div>
  );
}

function MockStatCard({
  num,
  label,
  color,
  index,
}: {
  num: string;
  label: string;
  color: string;
  index: number;
}) {
  return (
    <motion.div
      className="rounded-[10px] border border-border bg-surface-200 p-3 text-center dark:bg-navy-600"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.6 + index * 0.1, ease: "easeOut" }}
    >
      <div className={`text-lg font-bold ${color}`}>{num}</div>
      <div className="text-[10px] text-muted">{label}</div>
    </motion.div>
  );
}
