import FamiconsChevron from "@/assets/svg/famicons_chevron.svg?react";
import element from "@/assets/svg/sdashboard.svg?react";
import classRoom from "@/assets/svg/class_room.svg?react";
import my_course from "@/assets/svg/scourses.svg?react";
import assignments from "@/assets/svg/assignment.svg?react";
import quizzes from "@/assets/svg/quizzes.svg?react";
import discussion from "@/assets/svg/Discussion_forum.svg?react";
import live_classes from "@/assets/svg/live_classes.svg?react";
import Calendar from "@/assets/svg/sketch.svg?react";
import recorded_class from "@/assets/svg/sketch.svg?react";
import premium from "@/assets/svg/premium.svg?react";
import grades from "@/assets/svg/grades.svg?react";
import bluethub_ai from "@/assets/svg/bluethub_ai.svg?react";
import settings from "@/assets/svg/settings (1).svg?react";
import { NavLink } from "react-router-dom";
import B_2 from "@/assets/svg/B_2.svg?react";
import { useState } from "react";

const StudentSideBar = () => {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

    const navLinks = [
        { name: "Dashboard", path: "/student", icons: element },
        { name: "Classroom", path: "/student/class-room", icons: classRoom },
        { name: "My Course", path: "/student/my-course", icons: my_course },
        { name: "Assignments", path: "/student/Assignments", icons: assignments },
        { name: "Quizzes", path: "/student/Quizzes", icons: quizzes },
        {
            name: "Discussion Forum ",
            path: "/student/Discussion-Forum",
            icons: discussion,
        },
        {
            name: "Live Classes",
            path: "/student/Live-Classes",
            icons: live_classes,
        },
        { name: "Calendar", path: "/student/calendar", icons: Calendar },
        {
            name: "Recorded class ",
            path: "/student/recorded-class",
            icons: recorded_class,
        },
        { name: "Premium", path: "/student/Premium", icons: premium },
        {
            name: "Grades & Progress ",
            path: "/student/Grades-Progress",
            icons: grades,
        },
        { name: "Bluethub Ai", path: "/student/Bluethub-Ai", icons: bluethub_ai },
        { name: "Settings", path: "/student/Settings", icons: settings },
    ];

    return (
        <div
            className={`bg-white shadow-[0_15px_20px_0_rgba(41,35,130,0.1)] h-full  transition-all duration-300  overflow-y-scroll      
   [&::-webkit-scrollbar]:w-1  
  [&::-webkit-scrollbar]:h-2.5 
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-track]:bg-[#4F61E814]
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-gray-400
  dark:[&::-webkit-scrollbar-track]:bg-neutral-700
  dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
   ${isCollapsed ? "w-25 mx-auto" : "w-63.25"}`}
        >
            {/* nav section */}
            <div
                className={`flex  items-center p-4 border-b-2 border-[#3A3A3A33] ${isCollapsed ? "justify-center" : "justify-between"
                    }`}
            >
                {isCollapsed && (
                    <div
                        className="cursor-pointer"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        <B_2 className="size-8" />
                    </div>
                )}
                {!isCollapsed && (
                    <div>
                        <svg
                            width="101"
                            height="52"
                            viewBox="0 0 101 52"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M27.7842 19.3154V33.7148H25.0599V19.3154H27.7842ZM40.6526 22.9347V33.7148H37.909V32.3527C37.5587 32.8197 37.0982 33.1895 36.5274 33.4619C35.9696 33.7213 35.3599 33.8511 34.6983 33.8511C33.8551 33.8511 33.1091 33.6759 32.4605 33.3257C31.8119 32.9624 31.2995 32.4371 30.9233 31.7495C30.56 31.049 30.3784 30.2188 30.3784 29.2588V22.9347H33.1026V28.8696C33.1026 29.7258 33.3167 30.3874 33.7448 30.8544C34.1729 31.3084 34.7566 31.5355 35.4961 31.5355C36.2485 31.5355 36.8387 31.3084 37.2668 30.8544C37.6949 30.3874 37.909 29.7258 37.909 28.8696V22.9347H40.6526ZM53.3618 28.0913C53.3618 28.4804 53.3359 28.8307 53.284 29.142H45.4032C45.468 29.9204 45.7405 30.5301 46.2204 30.9712C46.7004 31.4122 47.2907 31.6328 47.9912 31.6328C49.003 31.6328 49.723 31.1982 50.1511 30.329H53.0894C52.778 31.3668 52.1813 32.223 51.2992 32.8976C50.417 33.5592 49.3338 33.89 48.0496 33.89C47.0118 33.89 46.0777 33.663 45.2475 33.2089C44.4302 32.7419 43.7881 32.0868 43.3211 31.2436C42.867 30.4004 42.64 29.4274 42.64 28.3248C42.64 27.2091 42.867 26.2297 43.3211 25.3865C43.7751 24.5433 44.4108 23.8947 45.228 23.4406C46.0453 22.9866 46.9858 22.7596 48.0496 22.7596C49.0744 22.7596 49.989 22.9801 50.7933 23.4212C51.6105 23.8622 52.2397 24.4914 52.6808 25.3087C53.1348 26.113 53.3618 27.0405 53.3618 28.0913ZM50.5403 27.3129C50.5273 26.6124 50.2744 26.0546 49.7814 25.6395C49.2884 25.2114 48.6852 24.9973 47.9717 24.9973C47.2972 24.9973 46.7264 25.2049 46.2594 25.62C45.8053 26.0221 45.5264 26.5864 45.4226 27.3129H50.5403ZM58.522 25.1724V30.3874C58.522 30.7506 58.6064 31.0166 58.775 31.1852C58.9566 31.3409 59.255 31.4187 59.6701 31.4187H60.9349V33.7148H59.2225C56.9264 33.7148 55.7783 32.5992 55.7783 30.3679V25.1724H54.4941V22.9347H55.7783V20.2688H58.522V22.9347H60.9349V25.1724H58.522ZM68.9655 22.779C69.7827 22.779 70.5092 22.9606 71.1448 23.3239C71.7805 23.6741 72.2735 24.1995 72.6237 24.9C72.9869 25.5876 73.1686 26.4178 73.1686 27.3907V33.7148H70.4443V27.7605C70.4443 26.9043 70.2303 26.2492 69.8022 25.7951C69.3741 25.3281 68.7903 25.0946 68.0509 25.0946C67.2985 25.0946 66.7018 25.3281 66.2607 25.7951C65.8326 26.2492 65.6186 26.9043 65.6186 27.7605V33.7148H62.8943V19.3154H65.6186V24.2773C65.9688 23.8103 66.4358 23.4471 67.0196 23.1876C67.6033 22.9152 68.252 22.779 68.9655 22.779ZM85.9361 22.9347V33.7148H83.1924V32.3527C82.8421 32.8197 82.3816 33.1895 81.8108 33.4619C81.253 33.7213 80.6433 33.8511 79.9817 33.8511C79.1385 33.8511 78.3926 33.6759 77.7439 33.3257C77.0953 32.9624 76.5829 32.4371 76.2067 31.7495C75.8435 31.049 75.6619 30.2188 75.6619 29.2588V22.9347H78.3861V28.8696C78.3861 29.7258 78.6001 30.3874 79.0282 30.8544C79.4563 31.3084 80.0401 31.5355 80.7795 31.5355C81.5319 31.5355 82.1222 31.3084 82.5503 30.8544C82.9784 30.3874 83.1924 29.7258 83.1924 28.8696V22.9347H85.9361ZM91.3482 24.5108C91.6985 23.9919 92.1785 23.5703 92.7882 23.246C93.4108 22.9217 94.1178 22.7596 94.9092 22.7596C95.8302 22.7596 96.6605 22.9866 97.3999 23.4406C98.1523 23.8947 98.7425 24.5433 99.1706 25.3865C99.6117 26.2167 99.8322 27.1832 99.8322 28.2858C99.8322 29.3885 99.6117 30.3679 99.1706 31.2241C98.7425 32.0673 98.1523 32.7224 97.3999 33.1895C96.6605 33.6565 95.8302 33.89 94.9092 33.89C94.1049 33.89 93.3979 33.7343 92.7882 33.423C92.1914 33.0986 91.7114 32.6835 91.3482 32.1776V33.7148H88.624V19.3154H91.3482V24.5108ZM97.0496 28.2858C97.0496 27.6372 96.9134 27.0794 96.641 26.6124C96.3815 26.1324 96.0313 25.7692 95.5902 25.5227C95.1621 25.2762 94.6951 25.153 94.1892 25.153C93.6962 25.153 93.2292 25.2827 92.7882 25.5422C92.3601 25.7886 92.0098 26.1519 91.7374 26.6319C91.4779 27.1118 91.3482 27.6761 91.3482 28.3248C91.3482 28.9734 91.4779 29.5377 91.7374 30.0177C92.0098 30.4977 92.3601 30.8674 92.7882 31.1268C93.2292 31.3733 93.6962 31.4965 94.1892 31.4965C94.6951 31.4965 95.1621 31.3668 95.5902 31.1074C96.0313 30.8479 96.3815 30.4782 96.641 29.9982C96.9134 29.5182 97.0496 28.9474 97.0496 28.2858Z"
                                fill="url(#paint0_linear_666_601)"
                            />
                            <path
                                d="M11.1392 37.4334C9.89673 37.4334 8.66867 37.289 7.45505 37C6.27034 36.711 5.21565 36.2776 4.29099 35.6997C3.97314 35.4685 3.75642 35.1362 3.64084 34.7028C3.52526 34.2405 3.46747 33.6915 3.46747 33.0558C3.46747 31.9288 3.68418 30.5996 4.11762 29.0682C4.55105 27.5078 5.10007 25.9041 5.76466 24.2571C6.42926 22.61 7.12276 21.0497 7.84514 19.576C8.56753 18.1023 9.21768 16.8887 9.79559 15.9351C10.3446 15.0972 11.0237 14.5193 11.8327 14.2014C12.6418 13.8547 13.4942 13.6813 14.39 13.6813C16.326 13.6813 17.1495 13.8547 16.8606 14.2014C16.2538 14.8949 15.6181 15.8051 14.9535 16.932C14.2889 18.059 13.6676 19.2148 13.0897 20.3995C12.5118 21.5553 12.0206 22.5667 11.616 23.4335C10.6625 25.4562 9.82449 27.4356 9.1021 29.3716C8.37971 31.2787 7.88849 32.8246 7.62843 34.0093C7.57064 34.2405 7.54174 34.4283 7.54174 34.5728C7.54174 34.8906 7.64288 35.1796 7.84514 35.4396C8.04741 35.6708 8.40861 35.8297 8.92873 35.9164C9.131 35.9453 9.31882 35.9742 9.49219 36.0031C9.69446 36.0031 9.89673 36.0031 10.099 36.0031C11.197 36.0031 12.2084 35.7286 13.133 35.1796C14.0577 34.6306 14.6356 33.8359 14.8668 32.7957C14.9535 32.4489 14.9823 32.0733 14.9535 31.6688C14.9535 30.9753 14.8523 30.2095 14.65 29.3716C14.4478 28.5336 14.1444 27.7534 13.7398 27.031C13.3642 26.3086 12.873 25.7741 12.2662 25.4273C11.9772 25.254 11.8327 25.0517 11.8327 24.8205C11.8327 24.5605 11.9917 24.4015 12.3095 24.3437C13.003 24.3437 13.7109 24.0692 14.4333 23.5202C15.1846 22.9712 15.8637 22.2488 16.4705 21.3531C17.1062 20.4573 17.6118 19.4893 17.9875 18.449C18.392 17.3799 18.5943 16.3541 18.5943 15.3717C18.5943 13.9847 18.1753 13.0311 17.3373 12.511C16.5283 11.962 15.5603 11.6875 14.4333 11.6875C13.4798 11.6875 12.4973 11.832 11.486 12.1209C10.4746 12.381 9.59333 12.6844 8.84204 13.0311C7.22389 13.7824 5.8658 14.7504 4.76777 15.9351C3.69863 17.1199 3.07738 18.2757 2.904 19.4026C2.75953 19.3448 2.48502 19.2726 2.08048 19.1859C1.67594 19.0992 1.2714 18.9258 0.866867 18.6658C0.491225 18.4057 0.274508 18.0301 0.216717 17.5388C0.13003 16.5275 0.375642 15.6317 0.953554 14.8516C1.56036 14.0425 2.38388 13.3634 3.42412 12.8144C4.49326 12.2365 5.66353 11.7597 6.93493 11.3841C8.23523 11.0084 9.54998 10.7339 10.8792 10.5606C12.2084 10.3872 13.4509 10.3005 14.6067 10.3005C15.0979 10.3005 15.5603 10.3149 15.9937 10.3438C16.4271 10.3727 16.8172 10.4161 17.164 10.4739C19.4756 10.8495 21.1371 11.6008 22.1484 12.7277C23.1598 13.8258 23.6655 15.0538 23.6655 16.4119C23.6655 17.6255 23.3043 18.8247 22.5819 20.0094C21.8595 21.1652 20.8626 22.1477 19.5912 22.9568C18.3487 23.7369 16.9184 24.1704 15.3002 24.2571C16.9761 24.6327 18.262 25.4418 19.1578 26.6843C20.0824 27.8979 20.5447 29.2126 20.5447 30.6285C20.5447 31.8132 20.198 32.9546 19.5045 34.0527C18.811 35.1507 17.6985 35.9887 16.1671 36.5666C14.6645 37.1445 12.9886 37.4334 11.1392 37.4334Z"
                                fill="url(#paint1_linear_666_601)"
                            />
                            <path
                                d="M29.0648 14.3613L32.4861 16.4131L37.6155 13.3354L32.4861 10.2578L27.3567 13.3354H32.4861V14.3613H29.0648ZM27.3567 14.3613V18.4648L28.3826 17.3261V14.9768L27.3567 14.3613ZM32.4861 20.5166L29.9214 18.9778L28.8955 18.3622V15.2846L32.4861 17.439L36.0766 15.2846V18.3622L32.4861 20.5166Z"
                                fill="#6C30D4"
                            />
                            <defs>
                                <linearGradient
                                    id="paint0_linear_666_601"
                                    x1="25.0571"
                                    y1="40.8979"
                                    x2="97.6578"
                                    y2="41.6536"
                                    gradientUnits="userSpaceOnUse"
                                >
                                    <stop stop-color="#4F61E8" />
                                    <stop offset="1" stop-color="#E924A1" />
                                </linearGradient>
                                <linearGradient
                                    id="paint1_linear_666_601"
                                    x1="0.365399"
                                    y1="50.5352"
                                    x2="20.1677"
                                    y2="50.5666"
                                    gradientUnits="userSpaceOnUse"
                                >
                                    <stop stop-color="#4F61E8" />
                                    <stop offset="1" stop-color="#E924A1" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                )}

                {!isCollapsed && (
                    <div
                        className="cursor-pointer"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        <FamiconsChevron />
                    </div>
                )}
            </div>

            <section className="my-7 px-4">
                <div className="my-7 mt-7 space-y-3">
                    {navLinks.map((link, idx) => {
                        const Icon = link.icons;
                        const pre = link.name === "Premium";

                        return (
                            <NavLink
                                key={link.name + idx}
                                to={link.path}
                                end={link.path === "/student"}
                                className={({ isActive }) =>
                                    `flex items-center gap-4 px-4 py-3  transition-colors cursor-pointer hover:bg-student-chestnut/20 ${isActive
                                        ? "bg-student-chestnut/20 border-2 border-student-chestnut text-student-chestnut"
                                        : ""
                                    }${isCollapsed ? " justify-center" : ""}`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <Icon className="w-5 h-5" />
                                        {!isCollapsed && (
                                            <h2
                                                className={`text-sm font-medium ${pre ? "text-student-chestnut" : ""
                                                    } ${isActive
                                                        ? "text-student-chestnut"
                                                        : "text-[#3A3A3ABF] font-poppins text-base capitalize"
                                                    } `}
                                            >
                                                {link.name}
                                            </h2>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}

export default StudentSideBar