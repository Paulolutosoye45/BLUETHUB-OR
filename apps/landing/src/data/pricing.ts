export interface PricingTier {
  label: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  featured?: boolean;
  cta: string;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    label: "Free",
    name: "Starter",
    price: "₦0",
    period: "forever free",
    features: [
      "Up to 50 students",
      "3 teacher accounts",
      "Basic question bank",
      "Parent monitoring",
    ],
    cta: "Get started free",
  },
  {
    label: "Most popular",
    name: "School Pro",
    price: "₦15k",
    period: "per month · per school",
    features: [
      "Unlimited students",
      "Unlimited teachers",
      "Offline recording + sync",
      "Full question bank",
      "Parent alert system",
      "Admin analytics dashboard",
    ],
    featured: true,
    cta: "Start 30-day free trial",
  },
  {
    label: "Enterprise",
    name: "District",
    price: "Custom",
    period: "for state / district boards",
    features: [
      "Everything in School Pro",
      "Multi-school dashboard",
      "Custom branding",
      "API access",
      "Dedicated support",
    ],
    cta: "Contact sales",
  },
];
