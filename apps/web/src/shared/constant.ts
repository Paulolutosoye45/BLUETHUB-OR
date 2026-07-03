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
// import teacherIcon from "@/assets/svg/teacher.svg";
// import MonitorPlayIcon from "@/assets/svg/monitor_play.svg";
import UploadIcon from "@/assets/svg/upload.svg";
import BookTextIcon from "@/assets/svg/jam_book.svg";
import PlayIcon from "@/assets/svg/play.svg";
import QuizzesIcon from "@/assets/svg/quizzes.svg";

export const TACADEMICLINKS = [
  {
    icons: studentIcon,
    name: "Student",
    path: "/teacher/student",
    disabled: true
  },

  {
    icons: coursesIcon,
    name: "Courses",
    path: "/teacher/courses",
    disabled: true
  },
  {
    icons: classIconIcon,
    name: "My Classroom",
    children: [
      { name: "Quiz", path: "/teacher/module/quiz" },
      { name: "Quiz Grading", path: "/teacher/module/quiz-grading" },
      { name: "Assessment", path: "/teacher/module/assessment" },
      { name: "Subject", path: "/teacher/module/subject" },
    ],
  },
  // {
  //   icons: MonitorPlayIcon,
  //   name: "Recorded Class ",
  //   path: "/teacher/recorded-class",
  // },

  {
    icons: UploadIcon,
    name: "Submit Lesson",
    path: "/teacher/submit-lesson",
  },
  {
    icons: libraryIcon,
    name: "My Lessons",
    path: "/teacher/my-lessons",
  },
  {
    icons: PlayIcon,
    name: "Start Class",
    path: "/teacher/start-class",
  },
  {
    icons: UploadIcon,
    name: "My Drafts",
    path: "/teacher/drafts",
  },
  {
    icons: AssignmentIcon,
    name: "Question/Assessment",
    path: "/teacher/assessment",
  },
  {
    icons: QuizzesIcon,
    name: "Question Bank",
    path: "/teacher/question-bank",
  },
  {
    icons: QuizzesIcon,
    name: "Quiz",
    path: "/teacher/quiz",
  },
  {
    icons: BookTextIcon,
    name: "My Syllabus",
    path: "/teacher/syllabus",
  },
  {
    icons: AssignmentIcon,
    name: "Approvals",
    path: "/teacher/approvals",
  },
];



export const navLink = [
  { name: "Dashboard", path: "/admin", icons: element },
  { name: "Approvals", path: "/admin/approvals", icons: AssignmentIcon },
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
      // { name: "Head Teacher", path: "/admin/registration/head-Teacher" },
      { name: "Register Subject", path: "/admin/registration/courses" },
      { name: "Register Class", path: "/admin/registration/class" },
    ],
  },
  // {
  //   name: "Student",
  //   path: "/admin/student",
  //   icons: studentIcon,
  //   children: [
  //     { name: "Register Student", path: "/admin/registration/student" },
  //   ],
  // },
  {
    name: "Library",
    path: "/admin/library",
    icons: libraryIcon,
    children: [
      { name: "Register Library", path: "/admin/registration/library" },
    ],
  },
  // {
  //   name: "Courses",
  //   path: "/admin/courses",
  //   icons: coursesIcon,
  //   children: [
  //     { name: "Register Courses", path: "/admin/registration/courses" },
  //   ],
  // },

  // {
  //   name: "Teachers",
  //   path: "/admin/teacher",
  //   icons: teacherIcon,
  //   children: [
  //     { name: "Register Teacher", path: "/admin/registration/Teacher" },
  //   ],
  // },
  // {
  //   name: "Class",
  //   path: "/admin/class",
  //   icons: classIconIcon,
  //   children: [{ name: "Register Class", path: "/admin/registration/class" }],
  // },
];
