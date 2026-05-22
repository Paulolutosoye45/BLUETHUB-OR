import TitleBar from "@/shared/title-bar";
import { Button } from "@bluethub/ui-kit";
import { questionService, type QuestionSummaryDto } from "@/services/question";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

const SubtopicQuestionList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const classroomId = searchParams.get("classroomId") ?? "";
  const subjectId = searchParams.get("subjectId") ?? "";
  const topicId = searchParams.get("topicId") ?? "";
  const subTopicId = searchParams.get("subTopicId") ?? "";
  const subTopicNameParam = searchParams.get("subTopicName") ?? "";
  const subjectNameParam = searchParams.get("subjectName") ?? "";

  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuestionSummaryDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!classroomId || !subjectId || !subTopicId) {
      setQuestions([]);
      setTotalCount(0);
      return;
    }

    setLoading(true);
    questionService
      .getQuestionsByClassroom(classroomId, {
        page: 1,
        pageSize: 50,
        subjectId,
        topicId: topicId || undefined,
        subTopicIds: [subTopicId],
        status: 2,
      })
      .then((res) => {
        const raw = res.data as any;
        // Backend returns questions at top level (data field is null)
        const items = (raw.questions ?? raw.data?.questions ?? []) as QuestionSummaryDto[];
        const total = (raw.totalCount ?? raw.data?.totalCount ?? items.length) as number;
        setQuestions(items);
        setTotalCount(total);
      })
      .catch(() => {
        setQuestions([]);
        setTotalCount(0);
        toast.error("Failed to load subtopic questions");
      })
      .finally(() => setLoading(false));
  }, [classroomId, subjectId, topicId, subTopicId]);

  const subTopicName = useMemo(() => {
    if (questions[0]?.subTopicName) return questions[0].subTopicName;
    return subTopicNameParam || "Selected Subtopic";
  }, [questions, subTopicNameParam]);

  return (
    <div className="p-3 sm:p-5 font-poppins">
      <div className="rounded-2xl border border-white/20 overflow-hidden bg-white/80 backdrop-blur-sm">
        <TitleBar title="question" hasVertical hasBackIcons onBack={() => navigate(-1)} />

        <div className="p-3 sm:p-5 lg:p-7 space-y-4">
          <div className="rounded-2xl border border-[#f3dccb] bg-gradient-to-r from-[#fff4ec] via-[#fff] to-[#eef6ff] p-4 sm:p-5">
            <p className="text-xs uppercase tracking-widest text-slate-500">Subtopic Questions</p>
            <h1 className="text-xl sm:text-2xl font-bold text-chestnut mt-1">{subTopicName}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {subjectNameParam || questions[0]?.subjectName || "Subject"}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-chestnut/10 text-chestnut text-xs font-semibold px-3 py-1.5">
                {totalCount} question{totalCount === 1 ? "" : "s"}
              </span>
              <Link
                to="/teacher/assessment/questionlist"
                className="rounded-full border border-slate-200 bg-white text-slate-700 text-xs font-semibold px-3 py-1.5 hover:border-chestnut/50"
              >
                Back to Subtopics
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">Questions</h2>
              {loading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
            </div>

            {!loading && questions.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-slate-400">
                No saved questions found for this subtopic.
              </div>
            )}

            <div className="divide-y divide-slate-100">
              {questions.map((question, idx) => (
                <article key={question.id} className="px-4 py-3 sm:py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Question {idx + 1}</p>
                      <p className="text-sm font-semibold text-slate-700 leading-5 mt-0.5">
                        {question.title || "Untitled question"}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {question.topicName || question.topic || "No topic"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                        {question.questionTypeName || `Type ${question.questionType}`}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
                        {question.difficultyLevelName || `Level ${question.difficultyLevel}`}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{question.creationDate}</span>
                    <span>{question.statusName || `Status ${question.status}`}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="sm:hidden">
            <Button
              onClick={() => navigate(-1)}
              className="w-full h-11 rounded-xl bg-chestnut hover:bg-chestnut/90 text-white font-semibold"
            >
              Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubtopicQuestionList;
