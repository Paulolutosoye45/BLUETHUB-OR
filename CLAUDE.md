# CLAUDE.md — Bluethub E-Learning Platform

> Last updated: June 2026. Full project state — use this to onboard any AI model.

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
