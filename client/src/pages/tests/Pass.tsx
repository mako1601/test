import * as React from 'react';
import * as ReactDOM from 'react-router-dom';
import { alpha, Backdrop, Badge, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Drawer, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';

import Page from '@components/Page';
import Header from '@components/Header';
import ContentContainer from '@components/ContentContainer';
import PassTestQuestion from '@components/PassTestQuestion';
import { useAuth } from '@context/AuthContext';
import { QuestionForCreate, TestForCreate, UserAnswer } from '@mytypes/testTypes';
import { getTestForPassingById, getTestResultById } from '@api/testApi';
import { useTestQuestions } from '@hooks/useTestQuestions';

export default function PassTest() {
  const navigate = ReactDOM.useNavigate();
  const { testId, testResultId } = ReactDOM.useParams<{ testId: string; testResultId: string }>();
  const nTestId = Number(testId);
  const nTestResultId = Number(testResultId);
  const { user, loading: userLoading } = useAuth();

  const [test, setTest] = React.useState<TestForCreate | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [answers, setAnswers] = React.useState<UserAnswer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);

  const [openWarning, setOpenWarning] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const allCompleted = answers.every(a => a.isCompleted);

  const { setIsDirty, useFinishTest } = useTestQuestions();

  React.useEffect(() => {
    if (userLoading) return;
    if (!user || isNaN(nTestId) || isNaN(nTestResultId)) {
      navigate("/", { replace: true });
    }
  }, [user, userLoading, nTestId, nTestResultId, navigate]);

  const fetchTest = React.useCallback(async () => {
    setLoading(true);
    try {
      const testData = await getTestForPassingById(nTestId);
      const testResultData = await getTestResultById(nTestResultId);

      if (testData.id !== testResultData.testId
        || user?.id !== testResultData.userId
        || testResultData.endedAt !== null) {
        navigate("/", { replace: true });
        return;
      }

      setIsDirty(true);

      const sortedQuestions = testData.questions.sort((a, b) => a.index - b.index);
      const questions: QuestionForCreate[] = [];
      const answersData: UserAnswer[] = [];
      for (const question of sortedQuestions) {
        let task: any;
        try {
          task = JSON.parse(question.taskJson);
        } catch (e) {
          console.warn(`Не удалось распарсить JSON для вопроса ${question.id}`, e);
          continue;
        }

        const q: QuestionForCreate = {
          id: question.id,
          testId: question.testId,
          index: question.index,
          type: question.type,
          text: question.text,
          imageUrl: question.imageUrl,
          task
        };

        questions.push(q);

        let t: any;
        if (question.type === 2 && Array.isArray(task.answer)) {
          t = { answer: task.answer.map((pair: [string, string]) => [pair[0], ""]) };
        }

        const a: UserAnswer = {
          questionId: question.id,
          type: question.type,
          isCompleted: false,
          task: t
        };
        answersData.push(a);
      }
      setTest({ ...testData, questions: questions });
      setAnswers(answersData);
    } catch (e) {
      console.error("Ошибка загрузки теста:", e);
      navigate("/", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [nTestId, nTestResultId, user, navigate]);

  React.useEffect(() => {
    if (user && !userLoading) {
      fetchTest();
    }
  }, [user, userLoading, fetchTest]);

  const finishTest = useFinishTest();

  const onFinishTest = async () => {
    setLoading(true);
    await finishTest(nTestResultId, answers);
    setLoading(false);
  };

  const handleEarlyFinishClick = () => {
    if (!allCompleted) {
      setOpenWarning(true);
    } else {
      onFinishTest();
    }
  };

  if (!test) return null;

  const questions = test.questions;
  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];

  return (
    <Page>
      <Box
        onClick={() => setDrawerOpen(true)}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '10rem',
          backgroundColor: 'rgba(0,0,0,0.01)',
          transition: 'background-color 0.3s',
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.03)',
          },
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          paddingBottom: 2,
          cursor: 'pointer',
          '&:hover .hoverText': {
            color: (theme) => alpha(theme.palette.text.secondary, 0.7)
          }
        }}
      >
        <Typography
          variant="body2"
          className="hoverText"
          sx={{
            textAlign: 'center',
            color: (theme) => alpha(theme.palette.text.secondary, 0.3),
            transition: 'color 0.3s'
          }}>
          Показать список заданий
        </Typography>
      </Box>
      <Header />
      <ContentContainer sx={{ justifyContent: 'space-between', position: 'relative' }}>
        <PassTestQuestion
          question={currentQuestion}
          answer={currentAnswer}
          updateQuestion={updatedQuestion => {
            setTest(prev => {
              if (!prev) return prev;
              const updatedQuestions = prev.questions.map((q, index) =>
                index === currentQuestionIndex ? updatedQuestion : q
              );
              return { ...prev, questions: updatedQuestions };
            });
          }}
          updateAnswer={updatedAnswer => {
            setAnswers(prev =>
              prev.map((a, index) =>
                index === currentQuestionIndex ? updatedAnswer : a
              )
            );
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', m: '3rem 0' }}>
          <Button disabled={currentQuestionIndex === 0} variant="outlined" onClick={() => setCurrentQuestionIndex(prev => prev - 1)}>Назад</Button>
          <Typography sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            {currentQuestionIndex + 1}/{questions.length}
          </Typography>
          {currentQuestionIndex < questions.length - 1 ? (
            <Button variant="outlined" onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>Далее</Button>
          ) : (
            <Button variant="outlined" onClick={handleEarlyFinishClick}>Завершить тест</Button>
          )}
        </Box>
        <Box sx={{ position: 'absolute', top: 0, right: 0, p: 2 }}>
          <Button variant="contained" onClick={handleEarlyFinishClick}>
            Завершить досрочно
          </Button>
        </Box>
      </ContentContainer>
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 250, p: 1 }}>
          <Typography fontSize="1rem" fontWeight="bold">Список вопросов</Typography>
          <List sx={{ p: 0 }}>
            {answers.map((answer, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton onClick={() => {
                  setCurrentQuestionIndex(index);
                  setDrawerOpen(false);
                }}>
                  <Badge
                    color={answer.isCompleted ? "success" : "error"}
                    variant="dot"
                    anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                    sx={{ '& .MuiBadge-badge': { minWidth: '5px', height: '5px' } }}
                  />
                  <ListItemText primary={`Задание ${index + 1}`} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Dialog open={openWarning} onClose={() => setOpenWarning(false)}>
        <DialogTitle>Внимание</DialogTitle>
        <DialogContent>
          Вы не выполнели все задания. Вы уверены, что хотите завершить тест?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenWarning(false); onFinishTest(); }}>Да</Button>
          <Button onClick={() => setOpenWarning(false)}>Нет</Button>
        </DialogActions>
      </Dialog>
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
        open={loading || userLoading || !test}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Page>
  );
}
