import { API, type TResponse } from ".";
import { X_Tenant_ID } from "./school";

export const QuestionTypeEnum = {
  MultipleChoice: 1,
  ShortAnswer: 2,
  Essay: 3,
  TrueOrFalse: 4,
  FillInTheBlank: 5,
  ImageBased: 6,
  BoardBased: 7,
  Mixed: 8,
} as const;

export const DifficultyLevelEnum = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
  Expert: 4,
} as const;

export interface CreateOptionPayload {
  optionLabel: string;
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface CreateQuestionPayload {
  clientId: string;
  originDevice: string;
  createdAtDevice: string;
  subjectId: string;
  topicId?: string | null;
  topic?: string;
  subTopic: string;
  title: string;
  textContent?: string;
  questionType: number;
  difficultyLevel: number;
  marksAllocation: number;
  options: CreateOptionPayload[];
  boardSessionId?: string | null;
  scanSessionId?: string | null;
  isScanned: boolean;
  extractedQuestionIndex?: number | null;
  aiConfidenceScore?: string | null;
  classroomId?: string | null;
  imageUrl?: string | null;
}

export interface CreateQuestionResponseData {
  questionId: string;
  clientId: string;
  isDuplicate: boolean;
}

export const questionService = {
  createQuestion: (payload: CreateQuestionPayload) =>
    API.post<TResponse<CreateQuestionResponseData>>("api/Question/createquestions", payload, {
      headers: { "X-Tenant-ID": X_Tenant_ID },
    }),
};
