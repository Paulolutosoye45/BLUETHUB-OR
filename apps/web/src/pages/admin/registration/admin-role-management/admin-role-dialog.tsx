import { Button, Checkbox, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@bluethub/ui-kit";
import { AlertTriangle, BarChart2, BookOpen, CheckSquare, GraduationCap, PencilLine, School, UserCheck, UserPlus, Users,  } from "lucide-react";
import { useState } from "react";



interface RoleOption {
    id: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    checked?: boolean;
}

function Avatar({ initials, size = "md" }: { initials: string; size?: "sm" | "md" | "lg" }) {
    const sz = size === "lg" ? "w-10 h-10 text-sm" : size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-xs";
    return (
        <div className={`${sz} rounded-full bg-chestnut flex items-center justify-center text-white font-semibold shrink-0`}>
            {initials}
        </div>
    );
}

const roleOptions: RoleOption[] = [
    { id: "teacher", label: "Teacher", description: "Manage lessons, classes and student assessments", icon: <GraduationCap size={18} />, color: "text-blue-500", checked: true },
    { id: "create_user", label: "Create User", description: "Manage user registration profile and full eco system", icon: <UserPlus size={18} />, color: "text-purple-500" },
    { id: "create_classes", label: "Create Classes", description: "Manage user registration profile and full eco system", icon: <BookOpen size={18} />, color: "text-indigo-500" },
    { id: "approve_classes", label: "Approve Classes", description: "Manage user registration profile and full eco system", icon: <CheckSquare size={18} />, color: "text-red-500" },
    { id: "manage_teachers", label: "Manage Teachers", description: "Manage teacher subject and profile", icon: <UserCheck size={18} />, color: "text-blue-400" },
    { id: "manage_students", label: "Manage Students", description: "Manage student Register, profiles and eco system", icon: <Users size={18} />, color: "text-red-400" },
    { id: "view_reports", label: "View Reports", description: "View Student learner eval", icon: <BarChart2 size={18} />, color: "text-blue-500" },
    { id: "manage_classroom", label: "Manage Class-Room", description: "Manage and direct a class room", icon: <School size={18} />, color: "text-purple-400" },
];


const AssignRoleDialog = () => {
    // const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set(["teacher"]));

    const toggle = (id: string) =>
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });


    return (
        <Dialog>
            <DialogTrigger>
                <Button className="flex  font-poppins  cursor-pointer items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition-opacity hover:opacity-90 bg-chestnut">
                    <PencilLine className="size-4" />
                    Edit
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm p-0 overflow-hidden rounded-2xl border-0 shadow-2xl bg-white">
                <DialogHeader className="px-5 pt-5 pb-3 bg-chestnut">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-[15px] font-semibold text-white">
                            Assign Role to User
                        </DialogTitle>
                        {/* <button onClick={onClose} className="text-white hover:text-gray-600 transition-colors">
                            <X size={16} />
                        </button> */}
                    </div>
                </DialogHeader>

                {/* User Card */}
                <div className="mx-5 mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 flex items-center gap-3">
                    <Avatar initials="AO" size="lg" />
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">Dr Ray Akinwale</p>
                        <p className="text-xs text-gray-500 truncate">rayakinwale@greenfieldcollege.edu · Teacher</p>
                        <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                            <UserCheck size={12} />
                            <span>Current Role: Teacher</span>
                        </div>
                    </div>
                </div>

                {/* Role Selection */}
                <div className="px-5">
                    <p className="text-sm font-semibold text-gray-700 mb-0.5">Select New Role(s)</p>
                    <p className="text-xs text-gray-400 mb-3">Check all roles to assign. Multiple roles can be selected</p>

                    <div className="grid grid-cols-2 gap-2 max-h-65 overflow-y-auto pr-0.5">
                        {roleOptions.map((role) => {
                            const isChecked = selected.has(role.id);
                            return (
                                <button
                                    key={role.id}
                                    onClick={() => toggle(role.id)}
                                    className={`relative text-left rounded-xl border p-3 transition-all ${isChecked
                                            ? "border-chestnut border-2 bg-indigo-50"
                                            : "border-gray-200 bg-white hover:border-gray-300"
                                        }`}
                                >
                                    <div className="flex items-start gap-2">
                                        <Checkbox
                                            checked={isChecked}
                                            className="mt-0.5 shrink-0 data-[state=checked]:bg-chestnut data-[state=checked]:border-indigo-600"
                                            onCheckedChange={() => toggle(role.id)}
                                        />
                                        <div>
                                            <div className={`mb-1 ${role.color}`}>{role.icon}</div>
                                            <p className="text-xs font-semibold text-gray-800 leading-tight">{role.label}</p>
                                            <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{role.description}</p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Warning */}
                <div className="mx-5 mt-3 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                    <AlertTriangle size={13} className="text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-amber-700 leading-snug">
                        Assigning a new role will update the user's permissions immediately. The user will be notified via email. Previous roles will be replaced unless retained.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 px-5 py-4">
                    <Button variant="outline" size="sm" className="text-xs px-4">
                        Cancel
                    </Button>
                    <Button size="sm" className="text-xs px-4 bg-chestnut hover:bg-indigo-700 text-white gap-1.5">
                        <UserPlus size={13} />
                        Assign Role
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default AssignRoleDialog