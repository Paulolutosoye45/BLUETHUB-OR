import type { LucideIcon } from "lucide-react";

export interface Feature {
  id: string;
  icon: LucideIcon | string;
  iconBg: string;
  title: string;
  description: string;
  tag: string;
  featured?: boolean;
  visual?: FeatureVisual;
}

export interface FeatureVisual {
  label: string;
  items: FeatureVisualItem[];
  caption: string;
}

export interface FeatureVisualItem {
  name: string;
  status: "synced" | "syncing" | "offline";
}

export const FEATURES: Feature[] = [
  {
    id: "offline-recording",
    icon: "📹",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    title: "Offline Class Recording",
    description:
      "Teachers record lessons entirely offline — no internet required during class. Videos and notes are stored locally and automatically pushed to the school database the moment the device reconnects.",
    tag: "Works offline · Auto-syncs",
    featured: true,
    visual: {
      label: "Recording Queue",
      items: [
        { name: "📁 Math - Chapter 3.mp4", status: "synced" },
        { name: "📁 English - Poem Analysis.mp4", status: "syncing" },
        { name: "📁 Biology - Cell Division.mp4", status: "offline" },
      ],
      caption: "Videos auto-sync on connection · Students access offline",
    },
  },
  {
    id: "question-bank",
    icon: "🏦",
    iconBg: "bg-accent-50 dark:bg-accent-600/10",
    title: "Smart Question Bank",
    description:
      "Teachers build questions organised by Topic → Subtopic. Each subtopic has its own dedicated question pool. Exams are auto-generated from the correct subtopic, ensuring precision testing.",
    tag: "Topic → Subtopic precision",
  },
  {
    id: "parent-monitoring",
    icon: "👨‍👩‍👧",
    iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
    title: "Parent Performance Monitor",
    description:
      "Parents see their child's attendance, scores by subject, quiz performance, and teacher notes — all in real time. Automated alerts notify parents of low scores or missed classes.",
    tag: "Real-time alerts to parents",
  },
  {
    id: "school-portal",
    icon: "🏫",
    iconBg: "bg-violet-100 dark:bg-violet-500/10",
    title: "Full School Administration Portal",
    description:
      "Schools get a dedicated administration portal. Register teachers, enrol students by class/arm, assign roles, manage timetables, and access school-wide performance analytics — all from one dashboard.",
    tag: "Admin · Teacher · Student · Parent roles",
  },
];

export const SCHOOL_PORTAL_FEATURES = [
  { icon: "👩‍🏫", title: "Manage Teachers", subtitle: "Register, assign subjects" },
  { icon: "👨‍🎓", title: "Enrol Students", subtitle: "By class, arm, year" },
  { icon: "🔐", title: "Role-based Access", subtitle: "Admin · Teacher · Student" },
  { icon: "📊", title: "School Analytics", subtitle: "Performance overview" },
  { icon: "📅", title: "Timetable Mgmt", subtitle: "Sessions & scheduling" },
] as const;
