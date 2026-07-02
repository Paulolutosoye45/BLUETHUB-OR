import ClassRoomCard from "./component/card";
import type { StudentSubjectItem } from "@/services/student";

interface ClassRoomListProps {
  loading: boolean;
  subjects: StudentSubjectItem[];
}

const ClassRoomList = ({ loading, subjects }: ClassRoomListProps) => {
  if (loading) {
    return (
      <div className="w-full min-h-[50vh] px-4 py-8 flex items-center justify-center text-sm text-gray-500">
        Loading your classroom subjects...
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="w-full min-h-[50vh] px-4 py-8 flex items-center justify-center text-sm text-gray-500">
        No registered subjects found for this student.
      </div>
    );
  }

  return (
    <div className="w-full min-h-[60vh] md:min-h-[90vh] px-3 sm:px-0 py-4 space-y-3">
      {subjects.map((subject) => (
        <ClassRoomCard key={subject.subjectId} subject={subject} />
      ))}
    </div>
  );
};

export default ClassRoomList;
