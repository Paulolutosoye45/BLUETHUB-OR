import element from "@/assets/svg/element-4.svg";
import Calendar from "@/assets/svg/calendar.svg";
import message from "@/assets/svg/message.svg";
import studentIcon from "@/assets/svg/student.svg";
import coursesIcon from "@/assets/svg/courses.svg";
import classIconIcon from "@/assets/svg/class.svg";
import logoutIcon from "@/assets/svg/logout.svg";
import settingsIcon from "@/assets/svg/settings.svg";
import AssignmentIcon from "@/assets/svg/assignment.svg";
import registrationIcon from "@/assets/svg/registration.svg";
import libraryIcon from "@/assets/svg/library.svg";
import teacherIcon from "@/assets/svg/teacher.svg";

export const TACADEMICLINKS = [
  {
    icons: studentIcon,
    name: "Student",
    path: "/teacher/student",
  },

  {
    icons: coursesIcon,
    name: "Courses",
    path: "/teacher/courses",
  },
  {
    icons: classIconIcon,
    name: "Class",
    path: "/teacher/class",
  },
  {
    icons: classIconIcon,
    name: "Recorded Class ",
    path: "/teacher/recorded-class",
  },

  {
    icons: AssignmentIcon,
    name: "Question/Assessment",
    path: "/teacher/assessment",
  },
];

export const TnavLink = [
  { name: "Dashboard", path: "/teacher", icons: element },
  { name: "Calendar", path: "/teacher/calendar", icons: Calendar },
  { name: "Message", path: "/teacher/message", icons: message },
];
export const Tother_menu_Link = [
  { name: "Settings", path: "/teacher/settings", icons: settingsIcon },
  { name: "Log Out", path: "#", icons: logoutIcon },
];

export const navLink = [
  { name: "Dashboard", path: "/admin", icons: element },
  { name: "Calendar", path: "/admin/calendar", icons: Calendar },
  { name: "Message", path: "/admin/message", icons: message },
];
export const other_menu_Link = [
  { name: "Settings", path: "/admin/settings", icons: settingsIcon },
  { name: "Log Out", path: "#", icons: logoutIcon },
];

export const ACADEMICLINKS = [
  {
    name: "Registration",
    icons: registrationIcon,
    children: [
      { name: "Register admin", path: "/admin/registration/Admin" },
      { name: "Register Student", path: "/admin/registration/student" },
      { name: "Register Teacher", path: "/admin/registration/Teacher" },
      { name: "Head Teacher", path: "/admin/registration/head-Teacher" },
      { name: "Register Subject", path: "/admin/registration/courses" },
      { name: "Register Class", path: "/admin/registration/class" },
    ],
  },
  {
    name: "Student",
    path: "/admin/student",
    icons: studentIcon,
    children: [
      { name: "Register Student", path: "/admin/registration/student" },
    ],
  },
  {
    name: "Library",
    path: "/admin/library",
    icons: libraryIcon,
    children: [
      { name: "Register Library", path: "/admin/registration/library" },
    ],
  },
  {
    name: "Courses",
    path: "/admin/courses",
    icons: coursesIcon,
    children: [
      { name: "Register Courses", path: "/admin/registration/courses" },
    ],
  },

  {
    name: "Teachers",
    path: "/admin/teacher",
    icons: teacherIcon,
    children: [
      { name: "Register Teacher", path: "/admin/registration/Teacher" },
    ],
  },
  {
    name: "Class",
    path: "/admin/class",
    icons: classIconIcon,
    children: [{ name: "Register Class", path: "/admin/registration/class" }],
  },
];
