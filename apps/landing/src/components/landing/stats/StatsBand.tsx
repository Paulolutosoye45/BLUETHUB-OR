import { STATS } from "@/data/stats";
import { Container } from "@/components/common/Container";
import { StaggerGroup, StaggerItem } from "@/components/common/StaggerGroup";

export function StatsBand() {
  return (
    <div className="bg-gradient-to-br from-navy-900 to-blue-800 py-12 sm:py-[70px]">
      <Container>
        <StaggerGroup className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4" staggerDelay={0.1}>
          {STATS.map((stat) => (
            <StaggerItem key={stat.label}>
              <div className="text-center text-white">
                <div className="font-serif text-[clamp(28px,4vw,52px)] font-bold leading-none">
                  {stat.value}
                </div>
                <div className="mt-1.5 text-xs sm:text-sm text-white/60">{stat.label}</div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </div>
  );
}
