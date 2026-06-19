
import Auth from '@/pages/auth';
import NotFound from '@/component/not-found';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import ClassRoom from '@/layouts/teacher/class/class-room';
import Replay from '@/component/reply';
import { Provider } from 'react-redux';
import { store } from '@/store';
import AdminLayout from '@/layouts/admin/admin-layout';
import AdminDashboard from '@/pages/admin/dashboard';
import TeacherLayout from '@/layouts/teacher/class/dashboard';
import TeacherDashboard from '@/pages/teacher/dashboard';
import RecordedLayout from '@/layouts/teacher/class/recorded/recorded';
import RecordedMain from '@/pages/teacher/recorded/recorded-main';
import Selectclass from '@/pages/teacher/recorded/select-class';
import Scheduleclass from '@/pages/teacher/recorded/schedule-class';
import SubmissionPortal from '@/pages/teacher/recorded/submission-portal';
import ApprovalStatus from '@/pages/teacher/recorded/approval-status';
import ApprovalStatusId from '@/pages/teacher/recorded/approval-status-Id';
import ResumeClass from '@/pages/teacher/component/resume-class';
import ClassInfo from '@/pages/teacher/component/class-info';
import StudenLayout from '@/pages/admin/registration/student/layout';
import Student from '@/pages/admin/registration/student/student';
import NewStudent from '@/pages/admin/registration/student/new-student';
import Enrollment from '@/pages/admin/registration/student/enrollment';
import EditStudent from '@/pages/admin/registration/student/edit-student';
// import CourseLayout from '@/pages/admin/registration/course/layout';
import CoursesMain from '@/pages/admin/registration/course/main';
import Teacherlayout from '@/pages/admin/registration/teacher/layout';
import TeacherMain from '@/pages/admin/registration/teacher/main';
import SubjectTeacher from '@/pages/admin/registration/teacher/subject-teacher';
import HeadTeacher from '@/pages/admin/registration/teacher/head-teacher';
import TeacherEditProfile from '@/pages/admin/registration/teacher/edit-profile';
import EmailModal from '@/pages/admin/registration/teacher/email-modal';
import ClassRegistration from '@/pages/admin/registration/course/class/class-registration';
import StudentsLayout from '@/layouts/student';
import StudentIndex from '@/pages/student/component/main';
import StudentSettings from '@/shared/setting';
import ProfileLayout from '@/pages/student/profile/layout';
import Profile from '@/pages/student/profile/profile';
import ClassIndex from '@/pages/student/class';
import ClassLayout from '@/pages/student/class/layout';
import ClassRoomlayout from '@/pages/student/class-room/layout';
import StudentClassRoom from '@/pages/student/class-room/class-room';
import CreateclassRoom from '@/pages/student/class-room/create-class-room';
import WatchClass from '@/pages/student/class/watch-class';
import StudentReplay from '@/pages/student/class/student-replay';
import Assessment from '@/pages/teacher/component/assessment';
import CreateQuizQuestion from '@/pages/teacher/component/create-quiz';
import TopicQuestionList from '@/pages/teacher/component/topic-question-list';
import SubtopicQuestionList from '@/pages/teacher/component/subtopic-question-list';
import GenerateQuiz from '@/pages/teacher/component/generate-quiz';
import Login from '@/pages/auth/login';
import NewPassword from '@/pages/auth/new-password';
import AdminProtectedRoute from '@/component/protected-routes/admin-routes';
import { PublicRoute } from '@/component/protected-routes/public-route';
import StudentProtectedRoute from '@/component/protected-routes/student-routes';
import UploadScan from '@/pages/teacher/component/upload-scan';
import ReviewQuestion from '@/pages/teacher/component/review-question';
import MyUploads from '@/pages/teacher/component/my-uploads';
import RegistrationAdmin from '@/pages/admin/registration';
import AdminRole from '@/pages/admin/registration/admin-role-management/admin-role';
import ViewAllSubject from '@/pages/admin/registration/course/class/view-all-subject';
import RegisterTeacherRole from '@/pages/admin/registration/teacher/assign-role';
import ViewStudent from '@/pages/admin/registration/student/view-student';
import RegisterNewSubject from '@/pages/admin/registration/course/class/register-new-subject';
import RegisterNewClass from '@/pages/admin/registration/course/class/register-new-class';
import ClassviewAll from '@/pages/admin/registration/course/class/class-view-all';
import LessonApproval from '@/pages/admin/dashboard/lesson-approval';
import MyLesson from '@/pages/teacher/component/my-lesson';
import SubmitLesson from '@/pages/teacher/component/submit-lesson';
import StartClass from '@/pages/teacher/component/start-class';
import QuizIndex from '@/pages/teacher/quiz';
import MySyllabus from '@/pages/teacher/Syllabus/my-syllabus';
import CreateSyllabus from '@/pages/teacher/Syllabus/create-syllabus';
import ApprovalsPage from '@/pages/admin/approvals';
import TeacherProtectedRoute from '@/component/protected-routes/teacher-routes';
import IdbViewer from '@/pages/dev/idb-viewer';
import DraftLessons from '@/pages/teacher/drafts';
import PendingUploads from '@/pages/teacher/pending-uploads';
import QuestionBankScan from '@/pages/teacher/question-bank';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to="/auth" replace />,
    },
    {
        path: '/auth',
        element: <PublicRoute><Auth /></PublicRoute>,
        children: [
            {
                index: true,
                element: <Login />,
            },
            {
                path: 'new-password',
                element: <NewPassword />,
            }
        ]
    },
    {
        path: '/replay',
        element: <Provider store={store}><Replay /> </Provider>
    },
    {
        path: "*",
        element: <NotFound />,
    },
    {
        path: "teacher/board",
        element: <TeacherProtectedRoute><ClassRoom /></TeacherProtectedRoute>,
    },

    // ── Dev routes (no auth) ─────────────────────────────────────────────────
    {
        path: "/dev/lesson-approval",
        element: <LessonApproval />,
    },
    {
        path: "/dev/submit-lesson",
        element: <SubmitLesson />,
    },
    {
        path: "/dev/start-class",
        element: <StartClass />,
    },
    {
        path: "/dev/idb",
        element: <IdbViewer />,
    },

    //  admin route
    {
        path: '/admin',
        element:
            <AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>,
        children: [
            {
                index: true,
                element: <AdminDashboard />
            },
            {
                path: "registration",
                children: [
                    {
                        path: "student",
                        element: <StudenLayout />,
                        children: [
                            {
                                index: true,
                                element: <Student />,
                            },
                            {
                                path: 'new',
                                element: <NewStudent />,
                            },
                            {
                                path: "enrollment",
                                element: <Enrollment />,
                            },
                            {
                                path: "all",
                                element: <ViewStudent />,
                            },
                            {
                                path: "edit",
                                element: <EditStudent />,
                            },
                            {
                                path: ":studentId/edit",
                                element: <EditStudent />,
                            },
                        ],
                    },
                    {
                        path: 'admin',
                        element: <AdminRole />
                    },
                    {
                        path: 'admin-permissions',
                        element: <RegistrationAdmin />
                    },
                    {
                        path: "courses",
                        element: <CoursesMain />,
                    },
                    {
                        path: "courses/new",
                        element: <RegisterNewSubject />,
                    },
                    {
                        path: "courses/view-all-subject",
                        element: <ViewAllSubject />,
                    },
                    { path: "class", element: <ClassRegistration /> },
                    { path: "class/new", element: <RegisterNewClass /> },
                    { path: "class/view-all", element: <ClassviewAll /> },
                    {
                        path: "teacher",
                        element: <Teacherlayout />,
                        children: [
                            { index: true, element: <TeacherMain /> },
                            { path: "teacher", element: <SubjectTeacher /> },
                            { path: "class-teacher", element: <SubjectTeacher /> },
                            { path: "admin-user", element: <SubjectTeacher /> },
                            { path: "head-teacher", element: <HeadTeacher /> },
                            { path: ":rolePath/edit", element: <TeacherEditProfile /> },
                            { path: "admin", element: <AdminRole /> },
                            {
                                path: "email-verification",
                                element: <EmailModal />,
                            },
                            {
                                path: "assign-role",
                                element: <RegisterTeacherRole />,
                            },
                        ],
                    },
                ],

            },
            {
                path: 'lesson-approval',
                element: <LessonApproval />
            },
            {
                path: 'approvals',
                element: <ApprovalsPage />
            }
        ]
    },

    //  teacher route
    {
        path: '/teacher',
        element:
            <TeacherLayout />,
        children: [
            {
                index: true,
                element:
                    <TeacherProtectedRoute>
                        <TeacherDashboard />
                    </TeacherProtectedRoute>
            },
            { path: "resume-class", element: <ResumeClass /> },
            { path: "class-info", element: <ClassInfo /> },
            { path: "assessment", element: <Assessment /> },
            { path: "my-lessons", element: <MyLesson /> },
            { path: "submit-lesson", element: <SubmitLesson /> },
            { path: "start-class", element: <StartClass /> },
            { path: "assessment/createQuiz", element: <CreateQuizQuestion /> },
            { path: "assessment/questionlist", element: <TopicQuestionList /> },
            { path: "assessment/questionlist/subtopic", element: <SubtopicQuestionList /> },
            { path: "assessment/generate-quiz", element: <GenerateQuiz /> },
            { path: "assessment/upload-scan", element: <UploadScan /> },
            { path: "assessment/review", element: <ReviewQuestion /> },
            { path: "assessments/My-Uploads", element: <MyUploads /> },
            {
                path: 'recorded-class',
                element: <RecordedLayout />,
                children: [
                    { index: true, element: <RecordedMain /> },
                    { path: "select-class", element: <Selectclass /> },
                    { path: "schedule-class", element: <Scheduleclass /> },
                    { path: "class-submission-portal", element: <SubmissionPortal /> },
                    { path: "classes/approval-status", element: <ApprovalStatus /> },
                    { path: "classes/approval-status/:id", element: <ApprovalStatusId /> },
                ]
            },
            { path: "quiz", element: <QuizIndex /> },
            { path: "syllabus", element: <MySyllabus /> },
            { path: "syllabus/create", element: <CreateSyllabus /> },
            { path: "drafts", element: <DraftLessons /> },
            { path: "pending-uploads", element: <PendingUploads /> },
            { path: "question-bank", element: <QuestionBankScan /> },
            { path: "approvals", element: <ApprovalsPage /> },
            { path: "create-syllabus", element: <CreateSyllabus /> },
        ]
    },

    // student route

    {
        path: "/student",
        element: <StudentProtectedRoute><StudentsLayout /></StudentProtectedRoute>,
        children: [
            { index: true, element: <StudentIndex /> },
            {
                path: "recorded-class",
                element: <ClassIndex />,
                children: [{ index: true, element: <ClassLayout /> }],
            },
            {
                path: "profile",
                element: <ProfileLayout />,
                children: [{ index: true, element: <Profile /> }],
            },
            {
                path: "class-room",
                element: <ClassRoomlayout />,
                children: [
                    { index: true, element: <StudentClassRoom /> },
                    { path: "create", element: <CreateclassRoom /> },
                ],
            },
            { path: "Settings", element: <StudentSettings /> },
            { path: "recorded-class/:classId/watch", element: <WatchClass /> },
            { path: "recorded-class/:classId/replay", element: <StudentReplay /> },
        ],
    },

])


export default router



// https://www.figma.com/design/FLJ2J0QZCDF6VzsbNWMQPa/arrange-bluett-e-learning-platform?node-id=0-1&p=f&t=Nacbs0o1As3FNd60-0