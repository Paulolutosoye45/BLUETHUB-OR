import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import bluethub from "@/assets/png/bluethub.png";
import arrowMenu from "@/assets/svg/arrow_menu_close.svg";
import arrowMenuOpen from "@/assets/svg/arrow_menu_open.svg";
import { localData } from "@/utils";
import { ACADEMICLINKS, navLink, other_menu_Link } from "@/shared/constant";
import { useAuthContext } from "@/contexts/auth-context";


const SideBar = () => {
    const navigate = useNavigate();
    const { logout } = useAuthContext();
    const [isCollapsed, setIsCollapsed] = useState<boolean | null>();
    const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);

    const toggleSidebar = () => {
        setIsCollapsed((prev) => {
            const newState = !prev;
            localData.save("navVNextT", newState);
            return newState;
        });
    };

    useEffect(() => {
        const openSide = localData.retrieve<boolean>("navVNextT");
        if (openSide !== null) {
            setIsCollapsed(openSide);
        }
    }, []);

    const handleLogout = () => {
        logout()
        navigate("/");
        console.log("Logging out...");
        // Add your logout logic here (e.g., clearing tokens, redirect)
    };

    return (
        <div className={`h-full bg-white transition-all duration-300   border-none overflow-y-scroll      
   [&::-webkit-scrollbar]:w-1
  [&::-webkit-scrollbar]:h-2.5 
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-track]:bg-gray-100
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-gray-400
  dark:[&::-webkit-scrollbar-track]:bg-neutral-700
  dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500
 ${isCollapsed ? "w-25 mx-auto" : "w-63.25"}`}
        >
            {/* <section className="flex justify-between items-center px-4 py-4 mb-4  font-poppins">
                <img src={bluethub} alt="logo" className="" />
                {!isCollapsed && (
                    <div className="text-center">
                        <h3 className="font-semibold text-xs text-chestnut">
                            Greenfieldcollege!
                        </h3>
                        <h3 className="font-semibold text-xl text-chestnut">
                            Administrator
                        </h3>
                    </div>
                )}
                <img
                    src={isCollapsed ? arrowMenuOpen : arrowMenu}
                    alt="toggle"
                    onClick={toggleSidebar}
                    className="cursor-pointer"
                />
            </section> */}

            <section className={`flex  items-center px-4 py-4 ${!isCollapsed ? ' justify-between' : ' justify-center'}`}>
                {!isCollapsed && <img src={bluethub} alt="logo" className="" />}
                {!isCollapsed && (
                    <div className="text-center">
                        <h3 className="font-semibold text-xs text-chestnut">
                            Greenfieldcollege!
                        </h3>
                        <h3 className="font-semibold text-xl text-chestnut">
                            Administrator
                        </h3>
                    </div>
                )}
                <img
                    src={isCollapsed ? arrowMenuOpen : arrowMenu}
                    alt="toggle"
                    onClick={toggleSidebar}
                    className="cursor-pointer"
                />
            </section>

            {/* Main Menu */}
            <section className=" px-4">
                {!isCollapsed ? (
                    <h1 className="text-[#29238280] text-[14px] font-semibold mb-4">
                        MAIN MENU
                    </h1>
                ) : (
                    <h1 className="text-[#29238280] text-[14px] text-center font-semibold mb-4">
                        MAIN
                    </h1>
                )}
                <div className="  space-y-3">
                    {navLink.map((link, idx) => (
                        <NavLink
                            key={link.name + idx}
                            to={link.path}
                            end={link.path === "/admin"}
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-4 py-3 rounded-lg transition-colors cursor-pointer ${isActive
                                    ? "bg-chestnut text-white"
                                    : "bg-[#29238214] hover:bg-[#29238233]"
                                }${isCollapsed ? " justify-center" : ""}`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <img
                                        src={link.icons}
                                        alt={link.name}
                                        className={`w-5  object-contain ${isActive ? "filter brightness-0 invert" : ""
                                            }`}
                                    />
                                    {!isCollapsed && (
                                        <h2
                                            className={`text-sm font-medium ${isActive ? "text-white" : "text-chestnut"
                                                }`}
                                        >
                                            {link.name}
                                        </h2>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </section>

            {/* Academic Management */}
            <section className=" px-4 mt-10">
                {!isCollapsed ? (
                    <h1 className="text-[#29238280] text-[14px] font-semibold mb-4">
                        ACADEMIC MANAGEMENT
                    </h1>
                ) : (
                    <h1 className=" text-center text-[#29238280] text-[14px] font-semibold mb-4">
                        AM
                    </h1>
                )}
                <div className="space-y-3">
                    {ACADEMICLINKS.map((link, idx) => {
                        const isOpen = openDropdownIndex === idx;
                        if (link.children) {
                            return (
                                <div key={link.name + idx}>
                                    {/* Dropdown Parent */}
                                    <div
                                        onClick={() => {
                                            if (!isCollapsed) {
                                                setOpenDropdownIndex((prev) =>
                                                    prev === idx ? null : idx
                                                );
                                            }
                                            setIsCollapsed(false);
                                        }}
                                        className={`flex items-center  px-4 py-2 rounded-lg cursor-pointer transition-colors ${isOpen
                                            ? "bg-chestnut text-white"
                                            : "bg-[#29238214] hover:bg-[#29238233]"
                                            } ${isCollapsed ? " justify-center" : "justify-between"}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={link.icons}
                                                alt={link.name}
                                                className={`w-5   object-contain ${isOpen ? "filter brightness-0 invert" : ""
                                                    }`}
                                            />
                                            {!isCollapsed && (
                                                <h2 className="text-sm font-medium">{link.name}</h2>
                                            )}
                                        </div>
                                        {!isCollapsed && (
                                            <span className="text-lg">{isOpen ? "▾" : "▸"}</span>
                                        )}
                                    </div>

                                    {/* Dropdown Children */}
                                    {!isCollapsed && isOpen && (
                                        <div className="ml-8 mt-2   border-l-2 border-[#D0C9F4] pl-2">
                                            {link.children.map((child, cIdx) => (
                                                <NavLink
                                                    to={child.path}
                                                    key={child.name + cIdx}
                                                    className={({ isActive }) =>
                                                        `block text-sm py-2 mb-1 rounded-md px-4 font-medium ${isActive
                                                            ? "bg-chestnut text-white"
                                                            : "text-chestnut hover:bg-[#ddd6f3] hover:text-chestnut"
                                                        } `
                                                    }
                                                >
                                                    {child.name}
                                                </NavLink>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        // Regular Single Links
                        return (
                            <NavLink
                                key={link.name + idx}
                                to={"/"}
                                className={({ isActive }) =>
                                    `flex items-center gap-4 px-4 py-3 rounded-lg transition-colors cursor-pointer ${isActive
                                        ? "bg-chestnut text-white"
                                        : "bg-[#29238214] hover:bg-[#29238233]"
                                    } ${isCollapsed ? " justify-center" : ""}`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <img
                                            src={link.icons}
                                            alt={link.name}
                                            className={`w-5 h-5 object-contain transition-all ${isActive ? "filter brightness-0 invert" : ""
                                                }`}
                                        />
                                        {!isCollapsed && (
                                            <h2
                                                className={`text-sm font-medium ${isActive ? "text-white" : "text-chestnut"
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

            <section className=" px-4 mt-6">
                {!isCollapsed ? (
                    <h1 className="text-[#29238280] text-[14px] font-semibold mb-4">
                        OTHER MENU
                    </h1>
                ) : (
                    <h1 className="text-[#29238280] text-center text-[14px] font-semibold mb-4">
                        MENU
                    </h1>
                )}
                <div className=" space-y-3">
                    {other_menu_Link.map((link, idx) => (
                        <NavLink
                            key={link.name + idx}
                            to={link.path}
                            onClick={link.name === "Log Out" ? handleLogout : undefined}
                            className={({ isActive }) => {
                                const baseClass =
                                    "flex items-center gap-4 mb-2 px-4 py-3 rounded-lg transition-colors cursor-pointer";
                                const collapsedClass = isCollapsed ? " justify-center" : "";

                                if (link.name === "Log Out") {
                                    return `${baseClass} bg-transparent  hover:bg-[#ffeded] ${collapsedClass}`;
                                }

                                return `${baseClass} ${isActive
                                    ? "bg-chestnut text-white"
                                    : "bg-[#29238214] hover:bg-[#29238233]"
                                    }${collapsedClass}`;
                            }}
                        >
                            {({ isActive }) => (
                                <>
                                    <img
                                        src={link.icons}
                                        alt={link.name}
                                        className={`w-5 h-5  object-contain ${link.name !== "Log Out" && isActive
                                            ? "filter brightness-0 invert"
                                            : ""
                                            }`}
                                    />
                                    {!isCollapsed && (
                                        <h2
                                            className={`text-sm font-medium ${link.name === "Log Out"
                                                ? "text-red-500"
                                                : isActive
                                                    ? "text-white"
                                                    : "text-chestnut"
                                                }`}
                                        >
                                            {link.name}
                                        </h2>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default SideBar