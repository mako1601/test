import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Link, CircularProgress } from '@mui/material';

import PageCard from './PageCard';
import { AnswerResult, QuestionForCreate, QuestionType, TestExtended, TestResult, TestResultExtended, UserAnswer } from '@mytypes/testTypes';
import { getAllTestResults, getAllTests } from '@api/testApi';
import { useAuth } from '@context/AuthContext';
import TestResultCard from './TestResultCard';

const ProfileResults = () => {
  const { user } = useAuth();
  const [tests, setTests] = React.useState<TestExtended[] | null>(null);
  const [testResults, setTestResults] = React.useState<TestResultExtended[] | null>(null);

  const fetchTests = async () => {
    try {
      const testResultData = await getAllTestResults({ userId: [user!.id], currentPage: 1, pageSize: 5, sortDirection: 1 });
      const uniqueTestIds = Array.from(new Set(testResultData.data.map(result => result.testId)));
      const testData = await getAllTests({ testId: uniqueTestIds });

      let testsExtended: TestExtended[] = [];
      for (const test of testData.data) {
        const parsedQuestions: QuestionForCreate[] = [];
        for (const question of test.questions) {
          let task: any;
          try {
            task = JSON.parse(question.taskJson);
          } catch (e) {
            console.warn(`Не удалось распарсить JSON для вопроса ${question.id}`, e);
            continue;
          }
          const parsedQuestion: QuestionForCreate = {
            id: question.id,
            testId: question.testId,
            index: question.index,
            type: question.type,
            text: question.text,
            imageUrl: question.imageUrl,
            task: task,
          };
          parsedQuestions.push(parsedQuestion);
        }
        const testExtended: TestExtended = {
          id: test.id,
          userId: test.userId,
          title: test.title,
          description: test.description,
          questions: parsedQuestions,
          createdAt: test.createdAt,
          updatedAt: test.updatedAt,
        };
        testsExtended.push(testExtended);
      }
      setTests(testsExtended);

      const testResultsExtended: TestResultExtended[] = testResultData.data.map(
        (result: TestResult) => {
          const answers: UserAnswer[] = JSON.parse(result.answersJson).map(
            (answer: AnswerResult): UserAnswer => {
              const parsedUserAnswerJson = JSON.parse(answer.userAnswerJson);
              switch (answer.type) {
                case QuestionType.SingleChoice:
                  return {
                    questionId: answer.questionId,
                    type: QuestionType.SingleChoice,
                    isCompleted: answer.isCorrect,
                    task: {
                      options: parsedUserAnswerJson.options || [],
                      answer: parsedUserAnswerJson.answer || [],
                    },
                  };
                case QuestionType.MultipleChoice:
                  return {
                    questionId: answer.questionId,
                    type: QuestionType.MultipleChoice,
                    isCompleted: answer.isCorrect,
                    task: {
                      options: parsedUserAnswerJson.options || [],
                      answer: parsedUserAnswerJson.answer || [],
                    },
                  };
                case QuestionType.Matching:
                  return {
                    questionId: answer.questionId,
                    type: QuestionType.Matching,
                    isCompleted: answer.isCorrect,
                    task: {
                      answer: parsedUserAnswerJson.answer || [],
                    },
                  };
                case QuestionType.FillInTheBlank:
                  return {
                    questionId: answer.questionId,
                    type: QuestionType.FillInTheBlank,
                    isCompleted: answer.isCorrect,
                    task: {
                      answer: parsedUserAnswerJson.answer || "",
                    },
                  };
                default:
                  throw new Error(`Неизвестный тип вопроса: ${answer.type}`);
              }
            }
          );

          return {
            id: result.id,
            userId: result.userId,
            testId: result.testId,
            attempt: result.attempt,
            score: result.score,
            answers: answers,
            startedAt: result.startedAt,
            endedAt: result.endedAt,
          };
        }
      );

      setTestResults(testResultsExtended);
    } catch (e: any) {
      console.log(e);
    }
  };

  React.useEffect(() => {
    if (user !== null)
      fetchTests();
  }, [user]);

  const testMap = React.useMemo(() => {
    const map = new Map<number, TestExtended>();
    tests?.forEach(test => map.set(test.id, test));
    return map;
  }, [tests]);

  return (
    <PageCard sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: testResults ? 'auto' : '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Недавно пройденные тесты</Typography>
        <Link component={RouterLink} to="all?sortDirection=1">Показать все</Link>
      </Box>
      {testResults && tests ? (
        testResults.length > 0 ? (
          <Box display="flex" flexDirection="column" gap={2}>
            {testResults.map(testResult => {
              return <TestResultCard key={testResult.id} testResult={testResult} test={testMap.get(testResult.testId)} />;
            })}
          </Box>
        ) : (
          <Box display="flex" alignItems="center" justifyContent="center" sx={{ height: '70vh' }}>
            <Typography fontWeight="bold" textAlign="center" color="text.secondary">
              У вас пока нет пройденных тестов.
            </Typography>
          </Box>
        )
      ) : (
        <Box display="flex" alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
          <CircularProgress color="inherit" />
        </Box>
      )}
    </PageCard>
  );
}

export default ProfileResults;