export interface Testimonial {
  id: string;
  stars: number;
  quote: string;
  authorName: string;
  authorRole: string;
  authorInitials: string;
  avatarBg: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "adaeze",
    stars: 5,
    quote:
      "The offline recording feature changed everything for us. Our teachers in areas with poor network can still deliver quality content, then sync later. Game changer.",
    authorName: "Adaeze Okonkwo",
    authorRole: "Principal, Lagos Model School",
    authorInitials: "AO",
    avatarBg: "bg-blue-600",
  },
  {
    id: "taiwo",
    stars: 5,
    quote:
      "As a parent, I can now see exactly how my daughter is doing in each subject without waiting for term results. I even get alerts when she misses class.",
    authorName: "Taiwo Makinde",
    authorRole: "Parent, Ibadan",
    authorInitials: "TM",
    avatarBg: "bg-accent-500",
  },
  {
    id: "kelechi",
    stars: 5,
    quote:
      "Setting questions by subtopic is brilliant. My students now get tested on exactly what was taught in each class — not a generic mixed exam. Results improved dramatically.",
    authorName: "Kelechi Eze",
    authorRole: "Mathematics Teacher, Enugu",
    authorInitials: "KE",
    avatarBg: "bg-emerald-500",
  },
];
