import { authService } from "@/services/auth";
import { Button, Checkbox, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@bluethub/ui-kit";
import { AxiosError } from "axios";
import { AlertTriangle, BarChart2, BookOpen, CheckSquare, GraduationCap, Info, Loader2, PencilLine, School, UserCheck, UserPlus, Users, } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";


interface Admin {
    id: string;
    firstName: string;
    lastName: string;
    userName: string;
    emailAddress: string;
    roleId: number;
    roleName: string;
    isActive: boolean,
    hasAccess: boolean,
    profileImage: string | null,
    guardianName: string | null,
    createdDate: string,
    modifiedDate: string
}


interface RoleOption {
    id: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    checked?: boolean;
    PermissionKey: number;
}

function Avatar({ initials, size = "md" }: { initials: string; size?: "sm" | "md" | "lg" }) {
    const sz = size === "lg" ? "w-10 h-10 text-sm" : size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-xs";
    return (
        <div className={`${sz} uppercase rounded-full bg-chestnut flex items-center justify-center text-white font-semibold shrink-0`}>
            {initials}
        </div>
    );
}
const roleOptions: RoleOption[] = [
    { id: "teacher", label: "Teacher", description: "Manage lessons, classes and student assessments", icon: <GraduationCap size={18} />, color: "text-blue-500", checked: true, PermissionKey: 64 },
    { id: "create_user", label: "Create User", description: "Manage user registration profile and full eco system", icon: <UserPlus size={18} />, color: "text-purple-500", PermissionKey: 128 },
    { id: "create_classes", label: "Create Classes", description: "Manage user registration profile and full eco system", icon: <BookOpen size={18} />, color: "text-indigo-500", PermissionKey: 2 },
    { id: "approve_classes", label: "Approve Classes", description: "Manage user registration profile and full eco system", icon: <CheckSquare size={18} />, color: "text-red-500", PermissionKey: 1 },
    { id: "manage_teachers", label: "Manage Teachers", description: "Manage teacher subject and profile", icon: <UserCheck size={18} />, color: "text-blue-400", PermissionKey: 4 },
    { id: "manage_students", label: "Manage Students", description: "Manage student Register, profiles and eco system", icon: <Users size={18} />, color: "text-red-400", PermissionKey: 8 },
    { id: "view_reports", label: "View Reports", description: "View Student learner eval", icon: <BarChart2 size={18} />, color: "text-blue-500", PermissionKey: 16 },
    { id: "manage_classroom", label: "Manage Class-Room", description: "Manage and direct a class room", icon: <School size={18} />, color: "text-purple-400", PermissionKey: 32 },
];


const AssignRoleDialog = ({ admin }: { admin: Admin }) => {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [errorMsg, setErrorMsg] = useState("");
    const [fetchLoading, setFetchLoading] = useState(true);   // loading permissions on mount
    const [assignLoading, setAssignLoading] = useState(false); // submitting the form
    const [originalPermissions, setOriginalPermissions] = useState<Set<number>>(new Set())
    const toggle = (id: number) => {
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const fetchPermissions = async (id: string) => {
        try {
            setFetchLoading(true);
            const response = await authService.getAdminPermissions(id);
            const permissions = new Set<number>(response.data.data.permissions);
            setSelected(permissions);
            setOriginalPermissions(permissions);
        } catch (error) {
            const msg =
                error instanceof AxiosError
                    ? error.response?.data?.responseMessage ??
                    error.response?.data?.message ??
                    error.message
                    : (error as Error).message;
            setErrorMsg(msg);
        } finally {
            setFetchLoading(false);
        }
    };

    useEffect(() => {
        fetchPermissions(admin.id);
    }, [admin.id]);

    const handleAssign = async () => {
        try {
            setAssignLoading(true);
            await authService.assignPermissions({ adminUserId: admin.id, permissions: Array.from(selected) });
            toast.success("Permissions assigned successfully");
            setOpen(false);
        } catch (error) {
            const msg =
                error instanceof AxiosError
                    ? error.response?.data?.responseMessage ??
                    error.response?.data?.message ??
                    error.message
                    : (error as Error).message;
            setErrorMsg(msg);
        } finally {
            setAssignLoading(false);
        }
    };


    const hasChanged =
        selected.size !== originalPermissions.size ||
        [...selected].some((p) => !originalPermissions.has(p));

    if (fetchLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-chestnut" size={24} />
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
                <Info className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
            </div>
        );
    }


    return (
        <Dialog open={open}
            onOpenChange={(isOpen) => {
                setOpen(isOpen);
                if (isOpen) {
                    fetchPermissions(admin.id); // ✅ fetch every time dialog opens
                }
            }}>
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
                    <Avatar initials={`${admin.firstName.charAt(0)}${admin.lastName.charAt(0)}`} size="lg" />
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{admin.firstName} {admin.lastName}</p>
                        <p className="text-xs text-gray-500 truncate">{admin.emailAddress} · {admin.roleName}</p>
                        <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                            <UserCheck size={12} />
                            <span>Current Role: {admin.roleName}</span>
                        </div>
                    </div>
                </div>

                {/* Role Selection */}
                <div className="px-5">
                    <p className="text-sm font-semibold text-gray-700 mb-0.5">Select New Role(s)</p>
                    <p className="text-xs text-gray-400 mb-3">Check all roles to assign. Multiple roles can be selected</p>

                    <div className="grid grid-cols-2 gap-2 max-h-65 overflow-y-auto pr-0.5">
                        {roleOptions.map((role) => {
                            const isChecked = selected.has(role.PermissionKey); // ✅ if PermissionKey is number
                            return (
                                <button
                                    key={role.id}
                                    onClick={() => toggle(role.PermissionKey)}
                                    className={`relative text-left rounded-xl border p-3 transition-all ${isChecked
                                        ? "border-chestnut border-2 bg-indigo-50"
                                        : "border-gray-200 bg-white hover:border-gray-300"
                                        }`}
                                >
                                    <div className="flex items-start gap-2">
                                        <Checkbox
                                            checked={isChecked}
                                            className="mt-0.5 shrink-0 data-[state=checked]:bg-chestnut data-[state=checked]:border-indigo-600"
                                            onCheckedChange={() => toggle(role.PermissionKey)}
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
                    <DialogClose asChild>
                        <Button variant="outline" size="sm" className="text-xs px-4">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button onClick={handleAssign} disabled={selected.size === 0 || assignLoading || !hasChanged} size="sm" className="text-xs px-4 bg-chestnut hover:bg-indigo-700 text-white gap-1.5">
                        {assignLoading ? (
                            <>
                                <UserPlus size={13} />
                                Assigning...
                            </>
                        ) : (
                            <>
                                <UserPlus size={13} />
                                Assign Role
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default AssignRoleDialog