import { ArrowRight, MapPin } from "lucide-react";

interface School {
  id: string;
  initials: string;
  color: string;
  name: string;
  location: string;
  students: number;
  joined: string;
  status: "Active" | "Pending" | "Inactive";
}

const SCHOOLS: School[] = [
  { id: "s1", initials: "ACA", color: "bg-blue-500",   name: "Adeola Crown Academy",      location: "Lagos, Nigeria",        students: 1240, joined: "June 22, 2026",   status: "Active" },
  { id: "s2", initials: "KSS", color: "bg-green-600",  name: "Kings Secondary School",     location: "Lagos, Nigeria",        students: 1300, joined: "July 22, 2026",   status: "Active" },
  { id: "s3", initials: "BHI", color: "bg-[#1a1d2e]",  name: "Bright Horizon Institute",   location: "Port Harcourt, Nigeria",students: 1300, joined: "Aug 22, 2026",    status: "Active" },
  { id: "s4", initials: "NIS", color: "bg-orange-500", name: "Nairobi International School",location: "Nairobi, Kenya",       students: 1300, joined: "Aug 22, 2026",    status: "Active" },
  { id: "s5", initials: "GCA", color: "bg-purple-500", name: "Grace College Accra",        location: "Accra, Ghana",          students: 1300, joined: "Aug 22, 2026",    status: "Active" },
];

const STATUS_STYLE: Record<School["status"], string> = {
  Active:   "bg-green-100 text-green-700",
  Pending:  "bg-yellow-100 text-yellow-700",
  Inactive: "bg-gray-100 text-gray-400",
};

interface RecentSchoolsProps {
  onViewAll?: () => void;
}

export function PanelRecentSchools({ onViewAll }: RecentSchoolsProps) {
  return (
    <div className="bg-white rounded-2xl font-space-grotesk border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
        <div className="flex items-center border-b  border-[#29238217] justify-between px-5 py-4 ">
        <h3 className="text-sm font-bold text-gray-700 font-space-grotesk">Recent School Registrations</h3>
        <button
          onClick={onViewAll}
          className="text-xs font-space-grotesk flex items-center  font-semibold text-[#292382] bg-[#EEEDF9] p-2 rounded-md hover:underline flex items-center gap-1"
        >
          View All <ArrowRight size={12} />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto pb-3">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#29238217]">
              <th className="text-left px-5 py-3 text-[10px] font-space-grotesk font-bold tracking-widest text-[#9390BC] uppercase">School</th>
              <th className="text-left px-4 py-3 text-[10px] font-space-grotesk font-bold tracking-widest text-[#9390BC] uppercase">Students</th>
              <th className="text-left px-4 py-3 text-[10px] font-space-grotesk font-bold tracking-widest text-[#9390BC] uppercase">Joined</th>
              <th className="text-left px-4 py-3 text-[10px] font-space-grotesk font-bold tracking-widest text-[#9390BC] uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#29238217]">
            {SCHOOLS.map((school) => (
              <tr key={school.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-md font-space-grotesk ${school.color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                      {school.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 font-space-grotesk">{school.name}</p>
                      <p className="text-gray-400 text-[10px] font-space-grotesk flex items-center gap-0.5 mt-0.5">
                        <MapPin size={9} /> {school.location}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold font-space-grotesk text-gray-600">{school.students.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-400 font-space-grotesk">{school.joined}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full font-space-grotesk text-[10px] font-bold ${STATUS_STYLE[school.status]}`}>
                    ● {school.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}