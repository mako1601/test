export const QUESTION_MIN = 1;
export const QUESTION_MAX = 50;
export const ANSWER_OPTION_MIN = 2;
export const ANSWER_OPTION_MAX = 5;
export const TITLE_MAX_LENGTH = 100;
export const DESCRIPTION_MAX_LENGTH = 500;

export const questionTypes = [
  { value: 0, label: 'Один правильный ответ' },
  { value: 1, label: 'Несколько правильных ответов' },
  { value: 2, label: 'Соответствие' },
  { value: 3, label: 'Заполнение пропущенного слова' }
];

export interface Test {
  id: number;
  userId: number;
  title: string;
  description?: string;
  questions: Question[];
  createdAt: string;
  updatedAt?: string;
}

export interface TestDto {
  title: string;
  description?: string;
  questions: Question[];
}

export interface Question {
  id: number;
  testId: number;
  index: number;
  type: number;
  text?: string;
  taskJson: string;
  imageUrl?: string;
}

export interface TestForSchemas {
  title: string;
  description?: string;
}

export interface TestForCreate {
  title: string;
  description?: string;
  questions: QuestionForCreate[];
}

export type QuestionMap = { [key: string]: QuestionForCreate };

export type QuestionForCreate =
  | (BaseQuestion & { type: QuestionType.SingleChoice; task: SingleChoiceTask })
  | (BaseQuestion & { type: QuestionType.MultipleChoice; task: MultipleChoiceTask })
  | (BaseQuestion & { type: QuestionType.Matching; task: MatchingTask })
  | (BaseQuestion & { type: QuestionType.FillInTheBlank; task: FillInTheBlankTask });

export interface BaseQuestion {
  id: number;
  testId: number;
  index: number;
  type: QuestionType;
  text?: string;
  imageUrl?: string;
}

export enum QuestionType {
  SingleChoice = 0,
  MultipleChoice = 1,
  Matching = 2,
  FillInTheBlank = 3,
}

interface Task<T> {
  answer: T;
}

export type SingleChoiceTask = Task<boolean[]> & { options: string[] };
export type MultipleChoiceTask = Task<boolean[]> & { options: string[] };
export type MatchingTask = Task<[string, string][]>;
export type FillInTheBlankTask = Task<string>;

export function createDefaultSingleChoiceQuestion(): QuestionForCreate {
  return {
    id: 0,
    testId: 0,
    index: 0,
    type: QuestionType.SingleChoice,
    text: "",
    task: {
      options: ["", ""],
      answer: [true, false]
    }
  };
}

export function createDefaultMultipleChoiceQuestion(): QuestionForCreate {
  return {
    id: 0,
    testId: 0,
    index: 0,
    type: QuestionType.MultipleChoice,
    text: "",
    task: {
      options: ["", ""],
      answer: [true, false]
    }
  };
}

export function createDefaultMatchingQuestion(): QuestionForCreate {
  return {
    id: 0,
    testId: 0,
    index: 0,
    type: QuestionType.Matching,
    task: {
      answer: [
        ["", ""],
        ["", ""]
      ]
    }
  };
}

export function createDefaultFillInTheBlankQuestion(): QuestionForCreate {
  return {
    id: 0,
    testId: 0,
    index: 0,
    type: QuestionType.FillInTheBlank,
    text: "",
    task: {
      answer: ""
    }
  };
}

export interface TestResult {
  id: number;
  userId: number;
  testId: number;
  attempt: number;
  score?: number;
  answersJson: string;
  startedAt: string;
  endedAt?: string;
}

export interface BaseAnswer {
  questionId: number;
  type: QuestionType;
  isCompleted: boolean;
}

export type UserAnswer =
  | (BaseAnswer & { type: QuestionType.SingleChoice; task: SingleChoiceTask })
  | (BaseAnswer & { type: QuestionType.MultipleChoice; task: MultipleChoiceTask })
  | (BaseAnswer & { type: QuestionType.Matching; task: MatchingTask })
  | (BaseAnswer & { type: QuestionType.FillInTheBlank; task: FillInTheBlankTask });

export interface AnswerResultDto {
  questionId: number;
  type: QuestionType;
  userAnswerJson: string;
}

export interface AnswerResult {
  questionId: number;
  type: QuestionType;
  userAnswerJson: string;
  isCorrect: boolean;
}

export interface TestExtended {
  id: number;
  userId: number;
  title: string;
  description?: string;
  questions: QuestionForCreate[];
  createdAt: string;
  updatedAt?: string;
}

export interface TestResultExtended {
  id: number;
  userId: number;
  testId: number;
  attempt: number;
  score?: number;
  answers: UserAnswer[];
  startedAt: string;
  endedAt?: string;
}