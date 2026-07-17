export interface HowItWorksStep {
  number: number;
  title: string;
  description: string;
}

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    number: 1,
    title: "Register your school",
    description:
      "Create a school portal in minutes. Add your school's name, classes, subjects, and arms.",
  },
  {
    number: 2,
    title: "Onboard users",
    description:
      "Invite teachers, enrol students, and connect parents. Each person gets their own role-based account.",
  },
  {
    number: 3,
    title: "Start teaching",
    description:
      "Teachers record classes (online or offline), build question banks, and set assignments.",
  },
  {
    number: 4,
    title: "Track & grow",
    description:
      "Parents and admins monitor performance in real time. Students stay motivated with progress tracking.",
  },
];
