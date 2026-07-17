import { GraduationCap, BookOpen, Heart } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface Role {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  perks: string[];
  borderColor: string;
}

export const ROLES: Role[] = [
  {
    id: "teachers",
    icon: GraduationCap,
    title: "Teachers",
    description:
      "Create content, set questions, track student performance, and upload offline recordings — all in one place.",
    perks: [
      "Record classes offline, sync later",
      "Build topic & subtopic question banks",
      "Auto-grade quizzes & assignments",
      "View per-student analytics",
      "Set homework & deadlines",
    ],
    borderColor: "border-blue-500",
  },
  {
    id: "students",
    icon: BookOpen,
    title: "Students",
    description:
      "Access lessons, take quizzes, track your own progress, and study at your own pace — even offline.",
    perks: [
      "Watch recorded lessons offline",
      "Take subtopic-specific quizzes",
      "See personal score history",
      "Download resources & notes",
      "Earn badges & streaks",
    ],
    borderColor: "border-emerald-500",
  },
  {
    id: "parents",
    icon: Heart,
    title: "Parents",
    description:
      "Stay connected to your child's education — monitor performance, receive alerts, and communicate with teachers.",
    perks: [
      "Real-time performance dashboard",
      "SMS & app alerts for low scores",
      "View attendance records",
      "Track homework completion",
      "Direct message teachers",
    ],
    borderColor: "border-accent-500",
  },
];

export const ADMIN_BANNER = {
  label: "School Administration",
  title: "A complete school management portal for administrators",
  description:
    "Register your school, onboard teachers and students, create class arms, manage timetables, and get a bird's-eye view of your entire institution's performance — all from one admin dashboard.",
  stat: "∞",
  statLabel: "Students per school",
  cta: "Register your school →",
} as const;
