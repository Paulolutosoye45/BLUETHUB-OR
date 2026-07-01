# My Classroom — Required Backend Endpoints

> Base URL: `https://techhubschmanagement.onrender.com`  
> Header: `X-Tenant-ID: "pearl"`  
> Auth: `Authorization: Bearer <jwt>`

---

## 1. GET `/api/User/teacher/students`
All students for the current teacher (based on their assigned classrooms/subjects).  
No query params.  
**Response:** `{ responseMessage, responseCode, status, data: Student[] }`

Each student object:
```json
{
  "id": "guid",
  "firstName": "string",
  "lastName": "string",
  "userName": "string",
  "emailAddress": "string",
  "roleData": {
    "classroom": { "className": "string" },
    "majorSubjects": [{ "subjectName": "string" }]
  },
  "isActive": true
}
```

---

## 2. GET `api/performance/classroom/{classroomId}`
Performance breakdown for a classroom.  
**Response:**
```json
{
  "responseMessage": "string",
  "responseCode": "string",
  "status": "successful|failed",
  "data": [{
    "classroomId": "guid",
    "classroomName": "string",
    "subjectId": "guid|null",
    "subjectName": "string|null",
    "studentCount": 0,
    "totalAttempts": 0,
    "completedAttempts": 0,
    "averageScorePercent": 0.0,
    "passRate": 0.0,
    "averageTimeTakenSeconds": 0|null,
    "lastActivityDate": "iso|null",
    "computedAt": "iso",
    "quizBreakdown": [{
      "quizCode": "string",
      "lessonTitle": "string",
      "lessonId": "string",
      "attemptCount": 0,
      "averageScore": 0.0,
      "passRate": 0.0
    }]
  }]
}
```

---

## 3. GET `api/Quiz/student/{studentId}/history`
Student's quiz attempt history.  
**Response:**
```json
{
  "responseMessage": "string",
  "responseCode": "string",
  "status": "successful|failed",
  "data": [{
    "attemptId": "guid",
    "quizCode": "string",
    "lessonId": "guid",
    "lessonTitle": "string",
    "attemptNumber": 1,
    "finalScorePercent": 0.0,
    "isPassed": true|null,
    "status": "string",
    "submittedAt": "iso|null"
  }]
}
```

---

## 4. GET `api/quiz/subject/{subjectId}`
Quizzes available for a subject.  
**Response:**
```json
{
  "responseMessage": "string",
  "responseCode": "string",
  "status": "successful|failed",
  "data": [{
    "quizCode": "string",
    "lessonTitle": "string",
    "totalQuestions": 0,
    "totalMarks": 0,
    "config": { /* QuizSettingsDisplayDto */ },
    "attemptStatus": { /* AttemptStatusDisplayDto */ },
    "bestScorePercent": 0|null,
    "bestIsPassed": true|null
  }]
}
```
