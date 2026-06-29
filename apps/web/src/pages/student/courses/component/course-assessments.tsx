import AssessmentCard, { AVAILABLE, LOCKED, type Assessment } from "./assessment-card";


const  CourseAssessments = ({
  available = AVAILABLE,
  locked = LOCKED,
}: {
  available?: Assessment[];
  locked?: Assessment[];
}) => {
  const total = available.length + locked.length;

  return (
    <div className="px-3 py-4 flex flex-col gap-6 min-h-screen">
      {/* Available section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-800">Assessments &amp; Quizzes</h2>
          <span className="text-xs font-semibold text-[#4F61E8]">{total} Total</span>
        </div>
        <div className="flex flex-col gap-3">
          {available.map((item) => (
            <AssessmentCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* Locked section */}
      <div>
        <h2 className="text-base font-bold text-gray-500 mb-3">Upcoming — locked</h2>
        <div className="flex flex-col gap-3">
          {locked.map((item) => (
            <AssessmentCard key={item.id} item={item} locked />
          ))}
        </div>
      </div>
    </div>
  );
}

export default CourseAssessments