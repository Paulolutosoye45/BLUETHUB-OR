import { EllipsisVertical, FilterIcon, Menu, Plus } from "lucide-react";
import { useState } from "react";
import AssignRoleDialog from "./admin-role-dialog";
import { useOutletContext } from "react-router-dom";
import {Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow} from '@bluethub/ui-kit'

const BRAND = "#292382";

type AdminStatus = "Active" | "Pending" | "Blocked";

interface Admin {
  id: number;
  name: string;
  email: string;
  role: string;
  roleLabel1: string;
  roleLabel2: string;
  status: AdminStatus;
  toggled: boolean;
  avatar: string; // color for avatar bg
  initials: string;
  hasPhoto?: boolean;
  photoStyle?: string;
}

const admins: Admin[] = [
  {
    id: 1,
    name: "Dr Roy",
    email: "royalex.system.co",
    role: "Teacher",
    roleLabel1: "Sub-Admin",
    roleLabel2: "Sub-Admin",
    status: "Active",
    toggled: true,
    avatar: "#1a1a2e",
    initials: "DR",
    hasPhoto: true,
    photoStyle: "bg-gray-800",
  },
  {
    id: 2,
    name: "Mrs Taiwo",
    email: "taiwo.system.co",
    role: "Finance Admin",
    roleLabel1: "Finance",
    roleLabel2: "finance",
    status: "Pending",
    toggled: false,
    avatar: "#c4a882",
    initials: "MT",
    hasPhoto: true,
    photoStyle: "bg-amber-200",
  },
  {
    id: 3,
    name: "Mrs Taiwo",
    email: "taiwo.system.co",
    role: "Finance Admin",
    roleLabel1: "Finance",
    roleLabel2: "finance",
    status: "Pending",
    toggled: false,
    avatar: "#8b5cf6",
    initials: "MT",
    hasPhoto: true,
    photoStyle: "bg-purple-400",
  },
  {
    id: 4,
    name: "Dr Roy",
    email: "royalex.system.co",
    role: "Sub-Admin",
    roleLabel1: "Sub-Admin",
    roleLabel2: "Sub-Admin",
    status: "Active",
    toggled: true,
    avatar: "#1a1a2e",
    initials: "DR",
    hasPhoto: true,
    photoStyle: "bg-gray-800",
  },
  {
    id: 5,
    name: "Dr Alex",
    email: "royalex.system.co",
    role: "Auditor",
    roleLabel1: "Auditor",
    roleLabel2: "Audit-trx",
    status: "Active",
    toggled: true,
    avatar: "#7c3aed",
    initials: "DA",
    hasPhoto: true,
    photoStyle: "bg-purple-700",
  },
  {
    id: 6,
    name: "Dr Roy",
    email: "royalex.system.co",
    role: "Teacher",
    roleLabel1: "Sub-Admin",
    roleLabel2: "Sub-Admin",
    status: "Active",
    toggled: true,
    avatar: "#1a1a2e",
    initials: "DR",
    hasPhoto: true,
    photoStyle: "bg-gray-800",
  },
];

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none shrink-0"
    style={{ backgroundColor: checked ? "#22c55e" : "#f59e0b" }}
  >
    <span
      className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
      style={{ transform: checked ? "translateX(24px)" : "translateX(4px)" }}
    />
  </button>
);

const StatusBadge = ({ status }: { status: AdminStatus }) => {
  const styles: Record<AdminStatus, { bg: string; text: string }> = {
    Active: { bg: "#22c55e", text: "#fff" },
    Pending: { bg: "#f59e0b", text: "#fff" },
    Blocked: { bg: "#ef4444", text: "#fff" },
  };
  const s = styles[status];
  return (
    <span
      className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {status}
    </span>
  );
};

const AvatarPhoto = ({ admin }: { admin: Admin }) => {
  const avatarColors: Record<number, string> = {
    1: "#1a1a3e",
    2: "#d4a5a5",
    3: "#8b5cf6",
    4: "#1a1a3e",
    5: "#6d28d9",
    6: "#1a1a3e",
  };

  return (
    <div
      className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 overflow-hidden border-2 border-gray-200"
      style={{ backgroundColor: avatarColors[admin.id] ?? "#9ca3af" }}
    >
      <span className="text-white text-xs font-bold">{admin.initials}</span>
    </div>
  );
};

const AdminRole = () => {
  const { openMobileNav } = useOutletContext<{ openMobileNav: () => void }>();
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<Admin[]>(admins);

  const filteredRows = rows.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    a.role.toLowerCase().includes(search.toLowerCase())
  );

  const totalAdmins = rows.length;
  const activeRole = rows.filter(r => r.status === "Active").length;
  const blockedUser = rows.filter(r => r.status === "Blocked").length;

  const toggleRow = (id: number) => {
    setRows(prev =>
      prev.map(r =>
        r.id === id
          ? { ...r, toggled: !r.toggled, status: !r.toggled ? "Active" : "Pending" }
          : r
      )
    );
  };

  return (
    <div className="lg:p-6 font-poppins">
      <div className="backdrop-blur-sm lg:rounded-2xl border border-white/20  overflow-hidden">

        <div className="flex items-center justify-between px-4 sm:px-5 h-14 sticky top-0 z-30 bg-chestnut">

          {/* Left: hamburger + title */}
          <div className="flex items-center gap-2 min-w-0">
            <Menu
              className="lg:hidden shrink-0 text-white cursor-pointer"
              onClick={openMobileNav}
            />
            <span className="text-white font-semibold text-sm sm:text-base truncate">
              Admin Role Management
            </span>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/50 text-white text-sm font-semibold hover:bg-white/10 transition-colors">
              Assign Role
            </button>
            {/* Assign Role — icon only on mobile */}
            <button className="sm:hidden flex items-center justify-center w-8 h-8 rounded-full border border-white/50 text-white hover:bg-white/10 transition-colors">
              <Plus size={16} />
            </button>
            <EllipsisVertical className="text-white cursor-pointer shrink-0" />
          </div>

        </div>

        {/* ── Page Body ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4  p-4 lg:p-8 bg-white/70 backdrop-blur-sm">

          {/* Search + Department filter row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

            {/* Search */}
            <div className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2.5 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, email, or role ID..."
                className="flex-1 text-sm text-gray-600 placeholder-gray-400 outline-none bg-transparent"
              />
            </div>

            {/* All Department button */}
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold bg-chestnut shrink-0">
              <FilterIcon className="size-4" />
              <span>All Department</span>
            </button>

          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {[
              { label: "Total Admins", value: totalAdmins },
              { label: "Active Role", value: activeRole },
              { label: "Blocked User", value: blockedUser },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-white border border-gray-200 rounded-2xl px-4 sm:px-5 py-3 sm:py-4 flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-2"
              >
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className="text-base font-medium text-chestnut">{value}</p>
              </div>
            ))}
          </div>

          {/* Table card */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

            {/* ── md+ Table (shadcn) ── */}
            <div className="hidden p-2 lg:p-0 md:block overflow-x-auto">
              <Table>
                <TableHeader style={{ backgroundColor: BRAND }}>
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="text-white font-medium text-sm w-[220px]">Name & Contact</TableHead>
                    <TableHead className="text-white font-medium text-sm">Role</TableHead>
                    <TableHead className="text-white font-medium text-sm">Role Label 1</TableHead>
                    <TableHead className="text-white font-medium text-sm">Role Label 2</TableHead>
                    <TableHead className="text-white font-medium text-sm w-[80px]" />
                    <TableHead className="text-white font-medium text-sm w-[130px]" />
                    <TableHead className="text-white font-medium text-sm w-[100px]" />
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-12 text-center text-sm text-gray-400">
                        No admins found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRows.map((admin) => (
                      <TableRow
                        key={admin.id}
                        className="hover:bg-gray-50/60 transition-colors border-gray-200"
                      >
                        {/* Name & Contact */}
                        <TableCell>
                          <div className="flex items-center gap-2.5 min-w-0">
                            <AvatarPhoto admin={admin} />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-blck-b2 capitalize truncate">{admin.name}</p>
                              <p className="text-xs text-blck-b2 truncate">{admin.email}</p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Role */}
                        <TableCell>
                          <span className="text-sm font-medium text-blck-b2 capitalize whitespace-nowrap">
                            {admin.role}
                          </span>
                        </TableCell>

                        {/* Role Label 1 */}
                        <TableCell>
                          <span className="text-sm font-medium text-blck-b2 capitalize whitespace-nowrap">
                            {admin.roleLabel1}
                          </span>
                        </TableCell>

                        {/* Role Label 2 */}
                        <TableCell>
                          <span className="text-sm font-medium text-blck-b2 capitalize whitespace-nowrap">
                            {admin.roleLabel2}
                          </span>
                        </TableCell>

                        {/* Toggle */}
                        <TableCell>
                          <Toggle checked={admin.toggled} onChange={() => toggleRow(admin.id)} />
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <div className="w-fit">
                            <StatusBadge status={admin.status} />
                          </div>
                        </TableCell>

                        {/* Edit */}
                        <TableCell>
                          <AssignRoleDialog />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* ── Mobile cards (unchanged) ── */}
            <div className="md:hidden divide-y divide-gray-200">
              {filteredRows.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-sm text-gray-400">No admins found</p>
                </div>
              )}
              {filteredRows.map((admin) => (
                <div key={admin.id} className="px-4 py-3 hover:bg-gray-50/60 transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <AvatarPhoto admin={admin} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-blck-b2 capitalize truncate">{admin.name}</p>
                        <p className="text-xs text-blck-b2 truncate">{admin.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Toggle checked={admin.toggled} onChange={() => toggleRow(admin.id)} />
                      <AssignRoleDialog />
                    </div>
                  </div>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    {admin.role && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md capitalize">
                        {admin.role}
                      </span>
                    )}
                    {admin.roleLabel1 && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md capitalize">
                        {admin.roleLabel1}
                      </span>
                    )}
                    {admin.roleLabel2 && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md capitalize">
                        {admin.roleLabel2}
                      </span>
                    )}
                    <div className="w-fit">
                      <StatusBadge status={admin.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRole;