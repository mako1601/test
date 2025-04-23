import * as React from 'react';
import * as ReactDOM from 'react-router-dom';
import { QuestionMap, QUESTION_MIN, QUESTION_MAX, ANSWER_OPTION_MIN, ANSWER_OPTION_MAX, QuestionType, QuestionForCreate, TestForSchemas, TestDto, UserAnswer, AnswerResultDto } from '@mytypes/testTypes';
import { createDefaultSingleChoiceQuestion, createDefaultMultipleChoiceQuestion, createDefaultMatchingQuestion, createDefaultFillInTheBlankQuestion } from '@mytypes/testTypes';
import { deleteImage, uploadImage } from '@api/cloudinaryApi';
import { createTest, finishTest, updateTest } from '@api/testApi';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { testSchema } from '@schemas/testSchemas';
import { extractImageIdFromUrl } from '@utils/extractImageIdFromUrl';
import { usePreventNavigation } from './usePreventNavigation';
import { SnackbarContext } from '@context/SnackbarContext';

export function useTestQuestions() {
  const [questions, setQuestions] = React.useState<QuestionMap>({
    [crypto.randomUUID()]: createDefaultSingleChoiceQuestion()
  });

  const [activeQuestionId, setActiveQuestionId] = React.useState<string>(Object.keys(questions)[0]);
  const [titleLength, setTitleLength] = React.useState(0);
  const [descriptionLength, setDescriptionLength] = React.useState(0);
  const [isGridVisible, setIsGridVisible] = React.useState(true);
  const [isDirty, setIsDirty] = React.useState(false);
  const allowNavigationRef = React.useRef(false);

  const blocker = usePreventNavigation(isDirty, allowNavigationRef);
  React.useEffect(() => {
    if (blocker.state === 'blocked') {
      const confirmation = window.confirm(
        "Внесенные изменения могут не сохраниться."
      );
      if (!confirmation) {
        blocker.reset();
      } else {
        blocker.proceed();
      }
    }
  }, [blocker.state]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<TestForSchemas>({
    resolver: yupResolver(testSchema)
  });

  const useCreateTest = () => {
    const { setSeverity, setMessage, setOpen } = React.useContext(SnackbarContext);
    const navigate = ReactDOM.useNavigate();

    return async (
      data: TestForSchemas,
      localImages: React.MutableRefObject<Map<string, File>>
    ) => {
      try {
        const updatedQuestions = await uploadLocalImages(localImages);
        const testData: TestDto = {
          title: data.title,
          description: data.description,
          questions: Object.values(updatedQuestions).map((question, qIndex) => ({
            id: question.id,
            testId: question.id,
            index: qIndex,
            type: question.type,
            text: question.text,
            taskJson: JSON.stringify(question.task),
            imageUrl: question.imageUrl
          }))
        };
        await createTest(testData);
        setSeverity("success");
        setMessage("Тест успешно создан!");
        allowNavigationRef.current = true;
        navigate("/profile/tests");
      } catch (e: any) {
        console.error(e);
        setSeverity("error");
        if (e.response) {
          setMessage(e.response.data);
        } else if (e.request) {
          setMessage("Сервер не отвечает, повторите попытку позже");
        } else if (e.message) {
          setMessage(e.message);
        } else {
          setMessage("Произошла неизвестная ошибка");
        }
      } finally {
        setOpen(true);
      }
    };
  };

  const useEditTest = () => {
    const { setSeverity, setMessage, setOpen } = React.useContext(SnackbarContext);
    const navigate = ReactDOM.useNavigate();

    return async (
      id: number,
      data: TestForSchemas,
      localImages: React.MutableRefObject<Map<string, File>>,
      initialImageUrls: React.MutableRefObject<string[]>
    ) => {
      try {
        const updatedQuestions = await uploadLocalImages(localImages);
        const questionImageUrls = new Set(Object.values(questions)
          .map(question => question.imageUrl)
          .filter(url => url !== undefined));
        const deletedImages = initialImageUrls.current.filter(url => !questionImageUrls.has(url));
        for (const imageUrl of deletedImages) {
          await deleteImage(extractImageIdFromUrl(imageUrl));
        }
        const testData: TestDto = {
          title: data.title,
          description: data.description,
          questions: Object.values(updatedQuestions).map((question, qIndex) => ({
            id: question.id,
            testId: question.testId,
            index: qIndex,
            type: question.type,
            text: question.text,
            taskJson: JSON.stringify(question.task),
            imageUrl: question.imageUrl
          }))
        };
        await updateTest(id, testData);
        setSeverity("success");
        setMessage("Тест успешно обновлён!");
        allowNavigationRef.current = true;
        navigate("/profile/tests");
      } catch (e: any) {
        console.error(e);
        setSeverity("error");
        if (e.response) {
          setMessage(e.response.data);
        } else if (e.request) {
          setMessage("Сервер не отвечает, повторите попытку позже");
        } else if (e.message) {
          setMessage(e.message);
        } else {
          setMessage("Произошла неизвестная ошибка");
        }
      } finally {
        setOpen(true);
      }
    };
  };

  const useFinishTest = () => {
    const { setSeverity, setMessage, setOpen } = React.useContext(SnackbarContext);
    const navigate = ReactDOM.useNavigate();

    return async (
      id: number,
      answers: UserAnswer[],
    ) => {
      try {
        const answerResults: AnswerResultDto[] = answers.map(answer => ({
          questionId: answer.questionId,
          type: answer.type,
          userAnswerJson: JSON.stringify(answer.task)
        }));
        await finishTest(id, answerResults);
        allowNavigationRef.current = true;
        navigate("/profile/results");
      } catch (e: any) {
        console.error(e);
        setOpen(true);
        setSeverity("error");
        if (e.response) {
          setMessage(e.response.data);
        } else if (e.request) {
          setMessage("Сервер не отвечает, повторите попытку позже");
        } else if (e.message) {
          setMessage(e.message);
        } else {
          setMessage("Произошла неизвестная ошибка");
        }
      }
    };
  };

  const addQuestion = () => {
    if (Object.keys(questions).length < QUESTION_MAX) {
      const newKey = crypto.randomUUID();
      setQuestions(prev => ({ ...prev, [newKey]: createDefaultSingleChoiceQuestion() }));
      setActiveQuestionId(newKey);
    }
  };

  const updateQuestion = (
    key: string,
    updates: Partial<{
      type?: QuestionType;
      text?: string;
      imageUrl?: string;
      task?: Partial<{
        options?: string[];
        answer?: boolean[] | [string, string][] | string;
      }>;
    }>
  ) => {
    setQuestions(prev => {
      const question = prev[key];
      if (!question) return prev;

      let updatedQuestion = { ...question, ...updates, task: { ...question.task, ...(updates.task || {}) } } as QuestionForCreate;

      if (updates.type !== undefined && updates.type === updatedQuestion.type) {
        switch (updates.type) {
          case QuestionType.SingleChoice:
            updatedQuestion = { ...createDefaultSingleChoiceQuestion(), id: question.id, testId: question.testId };
            break;
          case QuestionType.MultipleChoice:
            updatedQuestion = { ...createDefaultMultipleChoiceQuestion(), id: question.id, testId: question.testId };
            break;
          case QuestionType.Matching:
            updatedQuestion = { ...createDefaultMatchingQuestion(), id: question.id, testId: question.testId };
            break;
          case QuestionType.FillInTheBlank:
            updatedQuestion = { ...createDefaultFillInTheBlankQuestion(), id: question.id, testId: question.testId };
            break;
          default:
            updatedQuestion = { ...createDefaultSingleChoiceQuestion(), id: question.id, testId: question.testId };
        }
      }

      return { ...prev, [key]: updatedQuestion };
    });
  };

  const removeQuestion = (key: string) => {
    if (Object.keys(questions).length > QUESTION_MIN) {
      setQuestions(prev => {
        const { [key]: removed, ...rest } = prev;
        setActiveQuestionId(Object.keys(rest)[0]);
        return rest;
      });
    }
  };

  const addAnswerOption = (key: string) => {
    setQuestions(prev => {
      const question = prev[key];
      if (!question) return prev;

      if (question.type === 0 || question.type === 1) {
        if (question.task.options.length >= ANSWER_OPTION_MAX - 1) {
          return prev;
        } else {
          const newOptions = [...question.task.options, ""];
          const newAnswer = [...question.task.answer, false];
          return { ...prev, [key]: { ...question, task: { ...question.task, options: newOptions, answer: newAnswer } } as QuestionForCreate };
        }
      }

      if (question.type === 2) {
        if (question.task.answer.length >= ANSWER_OPTION_MAX) {
          return prev;
        } else {
          const newAnswer = [...question.task.answer, ["", ""]];
          return { ...prev, [key]: { ...question, task: { answer: newAnswer } } as QuestionForCreate };
        }
      }

      return prev;
    });
  };

  const updateAnswerOption = (key: string, index: number, value: string, pairIndex?: 0 | 1) => {
    setQuestions(prev => {
      const question = prev[key];
      if (!question) return prev;

      if ((question.type === 0 || question.type === 1) && Array.isArray(question.task.options)) {
        const newOptions = [...question.task.options];
        newOptions[index] = value;
        return { ...prev, [key]: { ...question, task: { ...question.task, options: newOptions } } };
      }

      if (question.type === 2 && Array.isArray(question.task.answer)) {
        const newAnswer = [...question.task.answer];
        const pair = [...newAnswer[index]] as [string, string];
        if (pairIndex === 0 || pairIndex === 1) {
          pair[pairIndex] = value;
        }
        newAnswer[index] = pair;

        return { ...prev, [key]: { ...question, task: { answer: newAnswer } } };
      }

      if (question.type === 3 && typeof question.task.answer === "string") {
        return { ...prev, [key]: { ...question, task: { answer: value } } };
      }

      return prev;
    });
  };

  const removeAnswerOption = (key: string, index: number) => {
    setQuestions(prev => {
      const question = prev[key];
      if (!question) return prev;

      if ((question.type === 0 || question.type === 1) && question.task.options.length > ANSWER_OPTION_MIN + 1) {
        const newOptions = question.task.options.filter((_, idx) => idx !== index);
        const newAnswer = question.task.answer.filter((_, idx) => idx !== index);

        if (!newAnswer.includes(true)) {
          newAnswer[0] = true;
        }

        return { ...prev, [key]: { ...question, task: { ...question.task, options: newOptions, answer: newAnswer } } };
      }

      if (question.type === 2 && question.task.answer.length > 2) {
        const newAnswer = question.task.answer.filter((_, idx) => idx !== index);
        return { ...prev, [key]: { ...question, task: { answer: newAnswer } } };
      }

      return prev;
    });
  };

  const reorderQuestionsOnDrag = (event: any) => {
    const { active, over } = event;
    if (over || active.id !== over.id) {
      setQuestions(prev => {
        const entries = Object.entries(prev);
        const oldIndex = entries.findIndex(([key]) => key === active.id);
        const newIndex = entries.findIndex(([key]) => key === over.id);
        if (oldIndex === -1 || newIndex === -1) {
          return prev;
        }
        const newOrder = [...entries];
        const [movedItem] = newOrder.splice(oldIndex, 1);
        newOrder.splice(newIndex, 0, movedItem);
        return Object.fromEntries(newOrder);
      });
    }
    setActiveQuestionId(active.id);
  };

  const uploadLocalImages = async (localImages: React.MutableRefObject<Map<string, File>>) => {
    const updatedQuestions = { ...questions };
    for (const [url, file] of localImages.current.entries()) {
      try {
        const imageUrl = await uploadImage(file);
        const questionId = Object.keys(updatedQuestions).find(id => updatedQuestions[id].imageUrl === url);
        if (questionId) {
          updatedQuestions[questionId].imageUrl = imageUrl;
        }
      } catch (e: any) {
        throw new Error("Файл не найден");
      }
    }
    return updatedQuestions;
  };

  return {
    questions,
    setQuestions,
    activeQuestionId,
    setActiveQuestionId,
    addQuestion,
    updateQuestion,
    removeQuestion,
    reorderQuestionsOnDrag,
    addAnswerOption,
    updateAnswerOption,
    removeAnswerOption,
    setIsDirty,
    uploadLocalImages,
    useCreateTest,
    useEditTest,
    useFinishTest,
    titleLength,
    setTitleLength,
    descriptionLength,
    setDescriptionLength,
    isGridVisible,
    setIsGridVisible,
    register,
    handleSubmit,
    errors,
    reset
  };
}