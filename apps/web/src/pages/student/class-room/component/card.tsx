import Svector from '@/assets/svg/s-vector.svg?react';

const members = [
  { name: "A", color: "bg-blue-500" },
  { name: "B", color: "bg-green-500" },
  { name: "J", color: "bg-red-500" },
  { name: "A", color: "bg-purple-500" },
  { name: "C", color: "bg-teal-400" },
];

const ClassRoomCard = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between w-full shadow-sm">
      {/* Left Content */}
      <div className="flex items-start gap-4">
        <div>
          <span className="inline-block rounded-full bg-[#7A65E3] p-3">
            <Svector className="w-8 h-8 text-white" />
          </span>
        </div>
        <div>
          <h3 className="font-semibold text-base capitalize text-gray-800">
            Mathematics Study Group - jss 2
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            For Student collaborate and share materials
          </p>
          <div className="flex gap-3 text-xs text-gray-400 mt-2">
            <span>52 Members</span>
            <span>• 5 Resources</span>
            <span>• 3 Events</span>
          </div>
        </div>
      </div>
      {/* Members avatars */}
      <div className="flex items-center gap-1 mr-2">
        {members.map((m, idx) => (
          <span
            key={idx}
            className={`rounded-full w-7 h-7 flex items-center justify-center ${m.color} text-white font-bold text-xs border-2 border-white`}
            style={{ marginLeft: idx !== 0 ? "-8px" : "0" }}
          >
            {m.name}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ClassRoomCard;
