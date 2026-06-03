import Svector from '@/assets/svg/s-vector.svg?react';
import studentService, { type StudentSubjectItem } from '@/services/student';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const members = [
  { name: "A", color: "bg-blue-500" },
  { name: "B", color: "bg-green-500" },
  { name: "J", color: "bg-red-500" },
  { name: "A", color: "bg-purple-500" },
  { name: "C", color: "bg-teal-400" },
];

interface ClassRoomCardProps {
  subject: StudentSubjectItem;
}

const ClassRoomCard = ({ subject }: ClassRoomCardProps) => {
  const navigate = useNavigate();

  const normalizedType = (subject.subjectType || '').toLowerCase();
  const typeBadgeClass = normalizedType === 'major'
    ? 'bg-blue-100 text-blue-700'
    : 'bg-amber-100 text-amber-700';

  const handleViewLessons = async () => {
    try {
      await studentService.getLessonsBySubject(subject.subjectId);

      navigate('/student/recorded-class', { state: { subjectId: subject.subjectId } });
    } catch (error) {
      console.error('Failed to load lessons for subject:', error);
      toast.error('Unable to load lessons for this subject');
    }
  };

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
            {subject.subjectName}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Access lessons and activities for this subject.
          </p>
          <div className="flex gap-3 text-xs text-gray-400 mt-2">
            <span className={`px-2 py-0.5 rounded-full font-medium ${typeBadgeClass}`}>
              {subject.subjectType}
            </span>
            <span>• {subject.category}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mr-2">
        <div className="hidden md:flex items-center gap-1">
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

        <button
          type="button"
          onClick={handleViewLessons}
          className="bg-student-chestnut hover:bg-[#3A4FE8] text-white rounded-md px-3 py-2 text-sm font-medium"
        >
          View lessons
        </button>
      </div>
    </div>
  );
};

export default ClassRoomCard;
