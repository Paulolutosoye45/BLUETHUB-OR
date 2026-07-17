import { TRUST_PARTNERS } from "@/data/navigation";
import { Container } from "@/components/common/Container";
import { ScrollReveal } from "@/components/common/ScrollReveal";

export function TrustBar() {
  return (
    <ScrollReveal>
      <div className="border-y border-border bg-surface-white py-5 sm:py-7 dark:bg-navy-600">
        <Container className="flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-10">
          <span className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-muted">
            Trusted by
          </span>
          <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8">
            {TRUST_PARTNERS.map((partner) => (
              <span
                key={partner}
                className="text-[12px] sm:text-[13px] font-semibold tracking-wide text-muted/60"
              >
                {partner}
              </span>
            ))}
          </div>
        </Container>
      </div>
    </ScrollReveal>
  );
}
