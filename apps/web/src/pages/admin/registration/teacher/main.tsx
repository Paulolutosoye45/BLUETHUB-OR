import { Link } from "react-router-dom";
import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@bluethub/ui-kit";
import { useState } from "react";
import { Check, ChevronDown, UserCircle } from "lucide-react";

const TeacherMain = () => {
    // Define your roles in an array
    const roles = [{ label: "Teacher" }, { label: "head-Teacher" }];

    const actions = [
        { label: "New User", variant: "primary", path: "" },
        { label: "Edit Profile", variant: "secondary", path: "edit" },
    ];

    const [selectRole, setSelectRole] = useState<string>("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    return (
        <div>
            <section className="rounded-2xl shadow-sm drop-shadow-sm bg-white/85  bg-opacity-80 h-[97vh] ">
                <section className="bg-chestnut   py-4 px-7 rounded-t-4xl ">
                    <h1 className="font-poppins font-semibold text-white text-xl">
                        Teacher’s Details
                    </h1>
                </section>
                <div className="flex justify-center gap-20 mt-7 px-4  ">
                    <div className="space-y-3 w-105">
                        <label className="text-chestnut font-semibold text-base flex items-center gap-2">
                            <UserCircle className="w-4 h-4" />
                            Role*
                        </label>

                        <DropdownMenu onOpenChange={setIsDropdownOpen}>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={`relative ring-2 w-full justify-between font-medium transition-all duration-300 border-0 py-6 px-4 text-base rounded-xl group ${selectRole
                                            ? "ring-chestnut/40 text-chestnut bg-chestnut/5"
                                            : "ring-chestnut/20 text-chestnut/50 bg-white/80"
                                        } hover:ring-chestnut/40 hover:bg-chestnut/5 focus:ring-chestnut/50 focus:ring-4`}
                                >
                                    <span
                                        className={selectRole ? "text-chestnut font-semibold" : ""}
                                    >
                                        {selectRole || "Select Role"}
                                    </span>

                                    <div
                                        className={`transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""
                                            }`}
                                    >
                                        <ChevronDown className="w-5 h-5 text-chestnut/70" />
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                className="w-(--radix-dropdown-menu-trigger-width) rounded-xl border-2 border-chestnut/10 shadow-xl bg-white/95 backdrop-blur-sm p-2"
                                align="start"
                                sideOffset={8}
                            >
                                <DropdownMenuGroup className="space-y-1">
                                    {roles.map((role) => (
                                        <DropdownMenuItem
                                            key={role.label}
                                            className={`font-medium text-base py-3 px-4 rounded-lg cursor-pointer transition-all duration-200 ${selectRole === role.label
                                                    ? "bg-chestnut text-white"
                                                    : "text-chestnut hover:bg-chestnut/10 hover:text-chestnut"
                                                }`}
                                            onClick={() => {
                                                setSelectRole(role.label);
                                            }}
                                        >
                                            <div className="flex items-center justify-between w-full">
                                                <span>{role.label}</span>
                                                {selectRole === role.label && (
                                                    <Check className="w-5 h-5 ml-2 text-white" />
                                                )}
                                            </div>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="h-[70vh] w-180 rounded-xl bg-white flex flex-col gap-6 items-center justify-center">
                        {actions.map(({ label, variant, path }) => (
                            <Button
                                key={label}
                                className={`font-poppins font-semibold text-xl leading-[27.78px] cursor-pointer px-40 py-10 
            ${variant === "primary"
                                        ? "bg-chestnut text-white hover:bg-chestnut capitalize"
                                        : "bg-white border-2 border-[#C4C4C4] text-[#EC1B2C] hover:bg-white capitalize"
                                    }`}
                                asChild
                            >
                                <Link to={`/admin/registration/teacher/${selectRole}/${path}`}>
                                    {label}
                                </Link>
                            </Button>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default TeacherMain;
