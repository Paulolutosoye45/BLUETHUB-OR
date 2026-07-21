# CLAUDE.md — Bluethub E-Learning Platform

> Last updated: July 2026. Full project state — use this to onboard any AI model.

---

## Quick Commands

```bash
# Windows: always run via cmd, not PowerShell (pnpm scripts break in PS)
pnpm install
pnpm web:dev          # dev server → http://localhost:5173
pnpm landing:dev      # landing page → http://localhost:3001
pnpm turbo build --filter=@bluethub/web
pnpm lint
pnpm check-types
pnpm format
```

---

## Monorepo Layout

```
Turborepo + pnpm workspaces
├── apps/web          — main e-learning app (React 19 + Vite + TypeScript)
├── apps/landing      — static marketing site
├── packages/ui       — @bluethub/ui-kit  (shadcn/Radix UI + Tailwind)
├── packages/eslint-config
└── packages/typescript-config
```

Path alias: `@/` → `apps/web/src/`

---

## Authentication

- `AuthContext` (`src/contexts/auth-context.tsx`) — single source of truth
- On mount: reads `localStorage.token`, parses JWT, fetches user via `authService.getUserById`
- `useAuthContext()` → `{ user, isAuthenticated, login, logout, refreshUser }`
- Passwords are **SHA-256 hashed client-side** via `utils/Hashing` before sending
- Token storage: `localStorage.token` (access), `localStorage.refreshToken`, `localStorage.schoolInfo`

---

## Two Axios Instances — IMPORTANT

| File | Name | Purpose |
|------|------|---------|
| `services/index.ts` | `API` (exported) | Shared instance. Attaches Bearer token. Used by ALL services. |
| `services/auth.ts` | `API` (local) | Has the **401 refresh interceptor** only. Queues failed requests, calls `/api/User/refresh-token`, retries. |

**Never mix them.** The `services/index.ts` `API` has a simple 401 → redirect-to-login fallback. The `services/auth.ts` local `API` has full refresh-and-retry logic.

---

## Multi-tenancy

Every API call needs `X-Tenant-ID: "pearl"`.  
Import the constant — never hardcode:
```typescript
import { X_Tenant_ID } from '@/services/school';   // or
import { X_Tenant_ID } from '@/utils/tenant';       // some services use this path
```

---

## API Base

```
VITE_API_BASE_URL  (set in .env)
Backend live at: https://techhubschmanagement.onrender.com
```

Standard response wrapper:
```typescript
type TResponse<T> = { responseMessage: string; responseCode: string; status: string; data: T; }
```

---

## Routing

Routes defined in `src/routes/index.tsx`.

| Path | Guard | Role |
|------|-------|------|
| `/admin` | `AdminProtectedRoute` | SuperAdministrator, Administrator |
| `/student` | `StudentProtectedRoute` | Student |
| `/teacher` | `TeacherProtectedRoute` | Teacher |
| `/auth` | `PublicRoute` (redirects if authed) | — |
| `/teacher/board` | `TeacherProtectedRoute` | Live whiteboard (Konva) |
| `/replay` | none | Class replay viewer |

### Student Routes (under `/student`)
```
/student                          → StudentIndex (dashboard)
/student/recorded-class           → ClassIndex → ClassLayout (lesson browser)
/student/recorded-class/:classId/watch   → WatchClass (replay downloader)
/student/recorded-class/:classId/replay  → StudentReplay (replay player)
/student/profile                  → Profile
/student/class-room               → ClassRoomlayout
/student/Settings                 → StudentSettings
```

### Teacher Routes (under `/teacher`)
```
/teacher                          → TeacherMain (dashboard)
/teacher/assessment               → Assessment (question bank hub)
/teacher/assessment/generate-quiz → GenerateQuiz (build & publish quiz)
/teacher/my-lesson                → MyLesson
/teacher/start-class              → StartClass (pre-class modal)
/teacher/board                    → ClassRoom (live Konva whiteboard)
/teacher/pending-uploads          → PendingUploads
/teacher/question-bank            → QuestionBankScan
```

---

## Services Layer (`src/services/`)

All services import `API` from `services/index.ts` and use `X_Tenant_ID`.

| File | What it does |
|------|-------------|
| `index.ts` | Shared `API` axios instance + `TResponse<T>` / `TNullable<T>` types |
| `auth.ts` | Login, logout, register, token refresh, getUserById, user CRUD |
| `school.ts` | Classrooms, subjects, teacher assignment. Exports `X_Tenant_ID = "pearl"` |
| `lesson.ts` | Submit lesson, draft, manifest, approval, teacher lesson list |
| `student.ts` | Student dashboard stats, classes, quizzes, registered subjects, lessons by subject, watch progress |
| `question.ts` | Create/update/sync questions, fetch by classroom/subject/topic, summary |
| `quiz.ts` | Teacher: create quiz. Student: fetch quiz, submit attempt |
| `board-session.ts` | Teacher live session, stroke batches, audio chunks, student manifest |
| `class-media.ts` | Media upload/management for live classes |
| `media-upload.ts` | Generic media upload helper |
| `assessment.ts` | Create/assign/list assessments, start attempt, submit-all answers, grade pending board answers |
| `student-board.ts` | Save/load student board strokes (`api/board/student/session/{sessionId}/batch`) |
| `admin.ts` | Admin user management |
| `approval.ts` | Lesson approval workflow |
| `user.ts` | Profile updates |
| `question-job.ts` | AI question extraction jobs |
| `question-scan.ts` | Question scan/OCR sessions |
| `teacher.ts` | Teacher-specific data |
| `admin-permissions.ts` | Role-based permissions |

---

## Confirmed API Endpoints

### Questions
```
POST api/questions/createquestions
POST api/questions/classroom/{classroomId}/questions           ← body: QuestionFilterViewModelV2
GET  api/questions/classroom/{classroomId}/subject/{subjectId}/topic/{topicId}
     ?page=1&pageSize=50&subTopicIds[]=id
GET  api/questions/classroom/{classroomId}/subject/{subjectId}/summary
```
> ⚠️ All question endpoints are **lowercase** (`api/questions/...`), NOT `api/Question/...`

### Quiz
```
POST api/Quiz/create                     ← body: { questionIds: string[] }
GET  api/Quiz/{quizId}                   ← student: fetch quiz with questions (no isCorrect)
POST api/Quiz/{quizId}/attempt           ← body: { answers: [{ questionId, selectedOptionId }] }
```

### Lessons
```
GET  api/lessons/subject/{subjectId}     ← student: lessons with media[]
POST api/lessons/submit
POST api/lessons/draft
GET  api/lessons/my-lessons
```

### Assessment (student)
```
POST api/Assessment/submit-all        ← body: { answers: [{ attemptId, questionId, selectedOptionId, typedAnswer, boardSessionId, audioUrl, isSkipped }] }
GET  api/Assessment/student/list
GET  api/Assessment/{id}/detail
POST api/Assessment/{id}/start
POST api/Assessment/{attemptId}/submit
GET  api/Assessment/result/{attemptId}
```

### Assessment (teacher / grading)
```
GET  api/Assessment/grading/pending   ← returns PendingGradeItem[] with boards[] containing stroke data
POST api/Assessment/grading/{answerId}/grade   ← body: { manualMarksObtained, teacherFeedback }
```

### Board (student assessment)
```
POST api/board/student/session/{sessionId}/batch   ← save stroke batch
GET  api/board/student/session/{sessionId}/board/{boardIndex}   ← load board strokes
```

### Auth
```
POST api/User/login
POST api/User/refresh-token
GET  api/User/{id}
```

---

## State Management

Redux Toolkit — **single slice**: `src/store/class-action-slice.ts`

Manages **live classroom state only**:
- `currentTool`, `fillColour` — drawing tool selection
- `isRecording`, `currentBoard`, `availableBoards: number[]`
- `timerMs` — recording timer
- `sendQueueRefList` — stroke upload queue (SEND_INTERVAL = 10 000 ms)

Key actions: `setCurrentTool`, `setCurrentBoard`, `addNewBoard`, `setAvailableBoards`, `startRecording`, `stopRecording`

Everything else uses local component state or context.

---

## IndexedDB (`src/utils/db.ts`)

Library: `idb`. DB_NAME = `"BluethubClassroom"`, DB_VERSION = 8.

### Stores
| Store constant | Purpose |
|---------------|---------|
| `STORE_CLASS` | Raw stroke batches from live drawing |
| `STORE_AUDIO` | Audio blob chunks |
| `STORE_SESSIONS` | Session metadata (status, lessonId, sync state) |
| `STORE_AUDIO_CHUNKS` | Audio chunk metadata with sync status |
| `STORE_STROKE_BATCHES` | Stroke batch metadata with sync status |
| `STORE_REPLAY_CACHE` | Replay download checkpoint data |

### Key Exports from `db.ts`
```typescript
// Strokes
addStrokes(batch), getClass(id), getClassBySession(sessionId),
getClassBySessionAndBoard(sessionId, board), deleteClassBySession(sessionId), clearClass()

// Audio
addAudio(batch), getAudio(id), getAudioBySession(sessionId),
deleteAudioBySession(sessionId), deleteAudioById(id), clearAudio()

// Sessions
getSession(id), updateSession(id, patch), saveSessionAsDraft(payload),
getAllSessions(), getSessionsByStatus(status), getInterruptedSessions(),
getSessionSyncStats(), cleanupPublishedSession(id), cleanupEntireSession(id)

// Sync helpers
getAudioChunksBySession(sessionId), updateAudioChunkStatus(id, status),
getStrokeBatchesBySession(sessionId), updateStrokeBatchStatus(id, status)

// Replay cache
getReplayDownloadCache(id), saveReplayDownloadCache(data), deleteReplayDownloadCache(id)

// Utilities
ensureAllStoresExist(), freeDiskSpace(), isStorageFullError(err)
```

---

## Question & Quiz System

### Teacher Flow
1. **Assessment page** (`/teacher/assessment`) — hub with three actions: Extract Question, Type Question, Generate Quiz
2. **Type Question** (`set-question.tsx`) — form to create a question with options
3. **Extract Question** — AI scan/OCR from uploaded document
4. **Generate Quiz** (`/teacher/assessment/generate-quiz`) — select class → subject → topic → subtopic → check questions → POST `api/Quiz/create` → get `quizCode`
5. **Submit Lesson** (`submit-lesson.tsx`) — teacher attaches quizId before submitting lesson for approval

### Student Flow
1. Student visits `/student/recorded-class`
2. Selects subject (auto-loaded from role data) → sees lesson cards
3. Cards with `lesson.quizId !== null` show **"Quiz attached"** badge + **"Take Quiz"** button
4. **"Lesson media files"** button → inline panel with video/PDF/image/audio viewer
5. **"Take Quiz"** button → opens quiz panel:
   - Start screen → loads questions via `GET api/Quiz/{quizId}`
   - Questions with radio-button options (no `isCorrect` exposed)
   - Submit → `POST api/Quiz/{quizId}/attempt` → score/pass-fail result
6. **"Watch"** button → `/student/recorded-class/:classId/watch` (live class replay downloader)

### Question Endpoint Rules (critical)
- Always lowercase: `api/questions/...` not `api/Question/...`
- `getQuestionsByClassroomSubjectTopic` requires **topicId** in the URL — guard before calling
- `subTopicIds` is always an **array** in the query params, even for single subtopic

---

## Live Whiteboard

Route: `/teacher/board`  
Stack: `react-konva`, Redux for drawing state, `pako` for stroke compression.

**Multi-board system** — teachers can create multiple boards (B1, B2, B3…):
- Redux: `availableBoards: number[]`, `currentBoard: number`
- Actions: `addNewBoard()` auto-increments and switches; `setCurrentBoard(n)` switches
- Board selector component: `layouts/teacher/class/component/board-selector.tsx`
- Strokes saved to IDB with `boardNumber` field
- On board switch: `getClassByBoard(n)` loads that board's strokes

**Recording & sync loop:**
- Audio recorded via `useAudioRecorder` → chunks saved to IDB → uploaded via `board-session.ts`
- Strokes compressed with pako → batched → Redux queue → uploaded every 10 000 ms
- Session manifest saved to `localStorage.currentBatches`

---

## UI Components

Import from `@bluethub/ui-kit`:
```typescript
import { Button, Input, Dialog, Table, Calendar, Tabs, Tooltip,
         Popover, InputOTP, AlertDialog, Separator, RadioGroup,
         Slider, ColorPicker, Dropdown } from '@bluethub/ui-kit';
```
Toast notifications: `import toast from 'react-hot-toast'`

For web-app-only components: `src/component/` (shared) or per-role `src/pages/{role}/component/`.

---

## Key Utilities (`src/utils/`)

| Utility | Purpose |
|---------|---------|
| `token` | `getToken()`, `setToken()`, `clearTokens()` |
| `localData` | Typed localStorage wrapper: `save(key, val)`, `retrieve(key)`, `remove(key)` |
| `Hashing(password)` | async SHA-256 hash — call before sending passwords to API |
| `saveActions` | Persists live-class recording batches to `localStorage.currentBatches` |
| `getDeviceType` | Returns `MOBILE \| TABLET \| DESKTOP` |
| `lesson-media-cache` | Cache API helpers for offline replay: `LESSON_MEDIA_CACHE`, `buildLessonScopedCacheKey` |
| `tenant` | Exports `X_Tenant_ID` (same value as `services/school.ts`) |

---

## My Classroom (Teacher Module) Page

Located at `apps/web/src/pages/teacher/my-classroom/index.tsx`. Route: `/teacher/module` (uses `MyClassroomPage`, not `ModulePage`).

### What it shows
- **Classroom tabs** if teacher has multiple classrooms (from `roleData.classrooms`)
- **Subject pills** within selected classroom — filters student list by subject
- **Classroom profile card** with performance stats (from `api/performance/classroom/{id}`)
- **Quick action bar** per subject: View Quizzes, Assessments, Question Bank
- **Student table** filtered by classroom + subject
- **Quiz History modal** — on student "Quiz" click, fetches `api/Quiz/student/{id}/history`

### Endpoints used
| Method | Endpoint | Where |
|--------|----------|-------|
| GET | `/api/User/teacher/students` | `moduleService.getTeacherStudents()` — all teacher's students |
| GET | `api/performance/classroom/{id}` | `performanceService.getClassroomPerformance()` — aggregate stats |
| GET | `api/Quiz/student/{id}/history` | `quizService.getStudentQuizHistory()` — per-student quiz attempts |

### Role detection
- `ClassTeacher` / `HeadTeacher` → "Full access" (shows all subjects)
- `SubjectTeacher` → "Subject access" (only subjects from roleData)

### Nav
- `shared/constant.ts` sidebar: "Module" renamed to "My Classroom"

---

## Known Gotchas / Past Bugs Fixed

| Problem | Root Cause | Fix |
|---------|-----------|-----|
| White screen on load | `db.ts` was empty — all IDB exports missing | Wrote full db.ts |
| 404 on question endpoints | Wrong casing `api/Question/` | Always use lowercase `api/questions/` |
| Questions not displaying | `getQuestionsByClassroom` was a GET; controller expects POST | Changed to `API.post()` with body |
| subTopicId not filtering | Sent `subTopicId: id` (string) | API expects `subTopicIds: [id]` (array) |
| Questions never load | No topicId guard — endpoint requires topicId in path | Added guard: `if (!topicId) return` |
| Submit quiz modal loop | "Add quiz" button both attached code AND submitted immediately; failure reopened modal | Separated: "Add" only sets `attachedQuizId`; Submit button checks it first |
| Replay board rushes to end | Audio chunk with `sizeBytes=0` created phantom batch | Skip chunks where `sizeBytes === 0` |
| pnpm commands fail | Running via PowerShell | Must run via `cmd /c pnpm ...` on Windows |
| Student board answers not saving | Individual `POST api/Assessment/answer` per question + `POST api/Assessment/{attemptId}/submit` | Changed to single `POST api/Assessment/submit-all` with all answers in `{ answers: [...] }` |

---

## Lesson Submit Payload (reference)

```typescript
interface SubmitLessonPayload {
  classroomId: string;
  subjectId: string;
  topicId: string;
  subTopicId: string;
  subTopic: string;
  aim: string;
  description: string;
  mediaFiles: MediaFilePayload[];   // { url, mediaName, mediaType, fileExtension, fileSizeBytes, displayOrder }
  quizId?: string | null;           // attach generated quiz
  accessDate?: string | null;
  accessTime?: string | null;
  durationMinutes?: number | null;
}
```

## Student Lesson Data Shape (reference)

```typescript
interface StudentPublishedLesson {
  id: string;
  aim: string; description: string; status?: string;
  subTopic: string; subTopicId?: string | null;
  teacherName: string; approvedByName?: string; approvedAt: string;
  subjectId: string; subjectName: string;
  topicId: string; topicName: string;
  classroomId?: string; className?: string;
  accessDate?: string | null; accessTime?: string | null;
  durationMinutes?: number | null; accessEndsAt?: string | null;
  mediaCount: number;
  media?: StudentLessonMedia[];     // url, mediaType, fileExtension, fileSizeBytes, displayOrder
  quizId?: string | null;           // present if teacher attached a quiz
  quizCode?: string | null;
}
```


Import shared components from `@bluethub/ui-kit` (workspace package at `packages/ui`). Built on shadcn/Radix UI + Tailwind. Exports: `Button`, `Input`, `Dialog`, `Table`, `Calendar`, `Toast` (via sonner), `Dropdown`, `Tabs`, `Tooltip`, `Popover`, `InputOTP`, `AlertDialog`, `Separator`, `RadioGroup`, `Slider`, `ColorPicker`, and others — see `packages/ui/src/index.ts` for the full list.

For local web-app-only components, use `src/component/` (shared across roles) or the per-role subdirectories under `src/pages/`.

### Path Alias

`@/` maps to `apps/web/src/` throughout the web app.

### Live Classroom (Whiteboard)

`/teacher/board` hosts the interactive whiteboard built with `konva` / `react-konva`. Recording batches are compressed and queued via Redux (`sendQueueRefList`) then uploaded in intervals (`SEND_INTERVAL = 10000 ms`). Replay is served at `/replay`.

---

## Actual Repository Implementation Notes

### App startup
- `apps/web/src/main.tsx` mounts React with `AuthProvider` and then renders `App`.
- `apps/web/src/App.tsx` calls `useTokenRefresh()` and initializes IndexedDB on startup with `ensureAllStoresExist()`.
- Global toasts are rendered by `@bluethub/ui-kit` `Toaster`.

### Authentication
- `apps/web/src/contexts/auth-context.tsx` is the single auth source of truth.
- It loads the user from JWT on mount, parsing `localStorage.token`, then calling `authService.getUserById(parsed.id)`.
- `login()` writes the access token and refresh token to localStorage, then hydrates the user.
- `logout()` clears token storage and resets auth state.
- `isAuthenticated` is based on both `user` and a stored token.

### Token refresh and idle logout
- `apps/web/src/hooks/useTokenRefresh.ts` periodically checks token expiry and user activity.
- It stores `accessTokenExpiresAt` and refreshes expired access tokens using `/api/User/refresh-token`.
- If the user has been idle for 30 minutes, it clears storage and redirects to `/auth`.
- User activity is tracked via `mousedown`, `keydown`, `touchstart`, and `scroll` events.

### Axios and API behavior
- `apps/web/src/services/index.ts` exports the main shared Axios instance used by most service modules.
- `apps/web/src/services/auth.ts` defines its own Axios instance with a refresh queue to retry concurrent 401 requests.
- `apps/web/src/utils/index.ts` also contains helper APIs and token utilities, including another `API` instance and tenant helper exports.
- `auth.ts` is the refresh-aware service entry point for auth-related calls.

### Multi-tenancy
- `X_Tenant_ID` is sourced from `apps/web/src/utils/tenant.ts`.
- It uses `VITE_TENANT_ID` if provided, otherwise defaults to `green`.
- Multiple services explicitly pass `X-Tenant-ID` in headers.

### Route guards
- `apps/web/src/component/protected-routes/admin-routes.tsx` allows `SuperAdministrator`, `Administrator`, and `Admin`.
- `apps/web/src/component/protected-routes/teacher-routes.tsx` allows `HeadTeacher`, `SubjectTeacher`, and `ClassTeacher`.
- `apps/web/src/component/protected-routes/student-routes.tsx` allows only `Student`.
- Unauthorized or unauthenticated users are redirected to `/auth`.

### Redux state
- `apps/web/src/store/class-action-slice.ts` is the one Redux slice in the repo.
- It tracks live class session state, including:
  - selected tool/action, fill color, and media selection
  - current board and available board list
  - recording state and session ID ref
  - send queue for compressed strokes
  - timer display, running state, elapsed seconds
- `apps/web/src/store/index.ts` configures the store with serializable middleware exceptions for persisted actions.

### IndexedDB and local persistence
- `apps/web/src/utils/db.ts` creates a DB named `BluethubClassroom` version `8`.
- Stores include:
  - `CLASS` for compressed stroke batches
  - `Audio` for audio blob batches
  - `Sessions` for local session metadata
  - `AudioChunks` for chunk sync state
  - `StrokeBatches` for stroke batch sync state
  - `ReplayCache` for replay download checkpoint data
- Session and sync stores include useful indexes: `lessonId`, `status`, `sessionId`, `syncStatus`, and compound keys for chunk/batch ordering.
- The file also exports cleanup and disk-space helpers.

### Utility functions
- `apps/web/src/utils/index.ts` provides central helpers:
  - `token` wrapper for auth tokens and localStorage management
  - `localData` JSON storage helpers
  - `Hashing()` and `hashPassword()` using Web Crypto SHA-256
  - `getDeviceType()` from `react-device-detect`
  - `saveActions()` for local recording batch metadata
  - time formatting/parsing utilities
  - batch timing constants and helper functions

### Build configuration
- Vite aliases are configured in `apps/web/vite.config.ts`:
  - `@` → `apps/web/src`
  - `@bluethub/ui-kit` → `packages/ui/src`
- The config excludes `@bluethub/ui-kit` from dependency optimization.

### Current repo notes
- `VITE_TENANT_ID` is the actual tenant header source; the fallback is `green`.
- The app does not implement a separate unauthorized page; it redirects straight to `/auth`.
- `AuthContext` re-fetches the user on startup if a valid token exists instead of restoring a full cached user object.
- The core live-class workflow is built around `IndexedDB` for stroke/audio persistence and Redux for runtime state.
