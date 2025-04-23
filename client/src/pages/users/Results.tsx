import * as React from 'react';
import * as ReactDOM from 'react-router-dom';
import { Box, CircularProgress, Divider, FormControl, FormControlLabel, Radio, RadioGroup, Stack, Typography } from '@mui/material';

import Page from "@components/Page";
import Header from "@components/Header";
import ContentContainer from "@components/ContentContainer";
import PageCard from "@components/PageCard";
import Pagination from '@components/Pagination';
import { getAllTestResults, getAllTests } from '@api/testApi';
import { useAuth } from '@context/AuthContext';
import { AnswerResult, QuestionForCreate, QuestionType, TestExtended, TestResult, TestResultExtended, UserAnswer } from '@mytypes/testTypes';
import TestResultCard from '@components/TestResultCard';

const PAGE_SIZE = 20;

export default function Results() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = ReactDOM.useSearchParams();
  const orderBy = (searchParams.get("orderBy") as | "Score" | "StartedAt" | "EndedAt" | "Duration" | "Attempt") || "StartedAt";
  const sortDirection = (searchParams.get("sortDirection") === "1" ? 1 : 0) as 0 | 1;
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const [tests, setTests] = React.useState<TestExtended[] | null>(null);
  const [totalCount, setTotalCount] = React.useState<number>(0);
  const [testResults, setTestResults] = React.useState<TestResultExtended[] | null>(null);

  const fetchTests = React.useCallback(async () => {
    try {
      const testResultData = await getAllTestResults({ userId: [user!.id], orderBy, sortDirection, currentPage, pageSize: PAGE_SIZE });
      const uniqueTestIds = Array.from(new Set(testResultData.data.map(result => result.testId)));
      const testData = await getAllTests({ testId: uniqueTestIds });
      setTotalCount(testResultData.totalCount);
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
    } catch (e) {
      setTests(null);
      setTestResults(null);
      setTotalCount(0);
    }
  }, [fetch, orderBy, sortDirection, currentPage]);

  React.useEffect(() => {
    if (user) {
      fetchTests();
    }
  }, [fetchTests]);

  const updateSearchParams = (newParams: Record<string, string | number>) => {
    setSearchParams((prev) => {
      const updatedParams = new URLSearchParams(prev);
      Object.entries(newParams).forEach(([key, value]) => {
        if (value) {
          updatedParams.set(key, value.toString());
        } else {
          updatedParams.delete(key);
        }
      });
      return updatedParams;
    });
  };

  const handlePageChange = (page: number) => {
    updateSearchParams({ page });
  };

  const handleOrderByChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSearchParams({ orderBy: e.target.value, page: 1 });
  };

  const handleSortDirectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSearchParams({ sortDirection: Number(e.target.value), page: 1 });
  };

  const testMap = React.useMemo(() => {
    const map = new Map<number, TestExtended>();
    tests?.forEach(test => map.set(test.id, test));
    return map;
  }, [tests]);

  return (
    <Page>
      <Header />
      {!testResults ? (
        <ContentContainer>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        </ContentContainer>
      ) : (
        <ContentContainer gap="1rem" sx={{ display: 'grid', gridTemplateColumns: '1fr auto' }}>
          <Stack gap="1rem">
            <Typography variant="h4">Ваши результаты</Typography>
            {testResults.length === 0 || currentPage > Math.ceil(totalCount / PAGE_SIZE) ? (
              <PageCard sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h5">У вас пока нет пройденных тестов.</Typography>
              </PageCard>
            ) : (
              <Stack gap={2}>
                <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2} >
                  {testResults.map(testResult => {
                    return <TestResultCard key={testResult.id} testResult={testResult} test={testMap.get(testResult.testId)} />;
                  })}
                </Box>
                <Pagination currentPage={currentPage} totalPages={Math.ceil(totalCount / PAGE_SIZE)} onPageChange={handlePageChange} />
              </Stack>
            )}
          </Stack>
          <Stack>
            <PageCard sx={{ position: 'sticky', top: '1rem', padding: '0.3rem 1rem' }}>
              <FormControl>
                <RadioGroup value={orderBy} onChange={handleOrderByChange}>
                  <FormControlLabel value="Score" control={<Radio />} label="По оценке" />
                  <FormControlLabel value="Duration" control={<Radio />} label="По времени прохождения" />
                  <FormControlLabel value="Attempt" control={<Radio />} label="По номеру попытки" />
                  <FormControlLabel value="StartedAt" control={<Radio />} label="По дате начала" />
                  <FormControlLabel value="EndedAt" control={<Radio />} label="По дате завершения" />
                </RadioGroup>
              </FormControl>
              <Divider />
              <FormControl>
                <RadioGroup value={sortDirection} onChange={handleSortDirectionChange}>
                  <FormControlLabel value="0" control={<Radio />} label="По возрастанию" />
                  <FormControlLabel value="1" control={<Radio />} label="По убыванию" />
                </RadioGroup>
              </FormControl>
            </PageCard>
          </Stack>
        </ContentContainer>
      )}
    </Page>
  );
}