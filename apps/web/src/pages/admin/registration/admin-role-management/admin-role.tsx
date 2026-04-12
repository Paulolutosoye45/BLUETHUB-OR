import { EllipsisVertical, FilterIcon } from "lucide-react";
import { useState } from "react";
import AssignRoleDialog from "./admin-role-dialog";

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

const Toggle= ({ checked, onChange }: { checked: boolean; onChange: () => void } ) => (
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

const StatusBadge = ({ status }:  {status: AdminStatus }) => {
  const styles: Record<AdminStatus, { bg: string; text: string }> = {
    Active:  { bg: "#22c55e", text: "#fff" },
    Pending: { bg: "#f59e0b", text: "#fff" },
    Blocked: { bg: "#ef4444", text: "#fff" },
  };
  const s = styles[status];
  return (
    <span
      className="px-3 py-1 rounded-full text-xs font-semibold"
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

const AdminRole= () => {
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
     <div className="p-6 font-poppins">
      <div className="backdrop-blur-sm rounded-2xl border border-white/20  overflow-hidden">

      {/* ── Top Nav ───────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-5 h-14 sticky top-0 z-30 bg-chestnut"
      >
        <span className="text-white font-semibold  text-base">Admin Role Management</span>
        <div className="flex items-center gap-3">
          {/* Assign Role button */}
          <button
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/50 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
          >
            Assign Role
          </button>
          {/* Three-dot */}
          <EllipsisVertical/>
        </div>
      </div>

      {/* ── Page Body ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 p-8 bg-white/70 backdrop-blur-sm">

        {/* Search + Department filter row */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2.5 flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by Admin name, email, or role ID......."
              className="flex-1 text-sm text-gray-600 placeholder-gray-400 outline-none bg-transparent"
            />
          </div>

          {/* All Department button */}
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold bg-chestnut shrink-0"
          >
            <FilterIcon className="size-4"/>
            All Department
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Admins", value: totalAdmins },
            { label: "Active Role",  value: activeRole  },
            { label: "Blocked User", value: blockedUser },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-white border border-gray-200 rounded-2xl px-5 py-4"
            >
              <p className="text-sm  font-medium text-gray-500 mb-2">{label}</p>
              <p className="text-base  font-medium  text-chestnut">{value}</p>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

          {/* Table header */}
          <div
            className="grid px-5 py-3"
            style={{
              backgroundColor: BRAND,
              gridTemplateColumns: "220px 1fr 1fr 1fr 90px 90px 90px",
            }}
          >
            <span className="text-white  font-medium text-sm">Name & Contact</span>
            <span className="text-white font-medium text-sm">Role Label</span>
            <span className="text-white font-medium text-sm" />
            <span className="text-white font-medium text-sm" />
            <span className="text-white font-medium text-sm" />
            <span className="text-white font-medium text-sm" />
            <span className="text-white font-medium text-sm" />
          </div>

          {/* Watermark area wrapper */}
          <div className="relative overflow-hidden">
            {/* Watermark text */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
              style={{ zIndex: 0 }}
            >
              <div className="flex flex-col items-center gap-1 opacity-[0.07]">
                {/* Star */}
                <svg className="w-40 h-40 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span
                  className="text-4xl font-black tracking-widest text-green-700"
                  style={{ letterSpacing: "0.15em" }}
                >
                  GREENFIELD COLLEGE
                </span>
              </div>
            </div>

            {/* Table rows */}
            <div className="relative z-10 divide-y divide-gray-200">
              {filteredRows.map((admin) => (
                <div
                  key={admin.id}
                  className="grid items-center px-5 py-3 hover:bg-gray-50/60 transition-colors"
                  style={{
                    gridTemplateColumns: "220px 1fr 1fr 1fr 90px 90px 90px",
                  }}
                >
                  {/* Name & Contact */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <AvatarPhoto admin={admin} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-blck-b2 capitalize truncate">{admin.name}</p>
                      <p className="text-xs text-blck-b2 truncate">{admin.email}</p>
                    </div>
                  </div>

                  {/* Role */}
                  <span className="text-sm font-medium text-blck-b2 capitalize">{admin.role}</span>

                  {/* Role Label 1 */}
                  <span className="text-sm font-medium text-blck-b2 capitalize">{admin.roleLabel1}</span>

                  {/* Role Label 2 */}
                  <span className="text-sm font-medium text-blck-b2 capitalize">{admin.roleLabel2}</span>

                  {/* Toggle */}
                  <div>
                    <Toggle
                      checked={admin.toggled}
                      onChange={() => toggleRow(admin.id)}
                    />
                  </div>

                  {/* Status badge */}
                  <div>
                    <StatusBadge status={admin.status} />
                  </div>

                  {/* Edit button */}
                  <div>
                   <AssignRoleDialog/>
                  </div>
                </div>
              ))}

              {filteredRows.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-sm text-gray-400">No admins found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default AdminRole;