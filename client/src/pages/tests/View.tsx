import * as React from 'react';
import * as ReactDOM from 'react-router-dom';
import { Box, Button, CircularProgress, Tooltip, Typography } from '@mui/material';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';

import Page from '@components/Page';
import Header from '@components/Header';
import ContentContainer from '@components/ContentContainer';
import { getAllTestResults, getTestById, startTest } from '@api/testApi';
import { SnackbarContext } from '@context/SnackbarContext';
import { Test, TestResult } from '@mytypes/testTypes';
import { getUserById } from '@api/userApi';
import { PageResult } from '@mytypes/commonTypes';
import { useAuth } from '@context/AuthContext';

export default function ViewTest() {
  const { setSeverity, setMessage, setOpen } = React.useContext(SnackbarContext);
  const { user } = useAuth();
  const navigate = ReactDOM.useNavigate();
  const { id } = ReactDOM.useParams();
  const testId = Number(id);
  const [test, setTest] = React.useState<Test | null>(null);
  const [author, setAuthor] = React.useState<{ lastName: string; firstName: string; middleName?: string } | null>(null);
  const [testResults, setTestResults] = React.useState<PageResult<TestResult> | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (isNaN(testId)) return;

    const fetchTest = async () => {
      setLoading(true);
      try {
        const testData = await getTestById(testId);
        const userData = await getUserById(testData.userId);
        const testResultsData = await getAllTestResults({ testId: [testData.id] });
        setTest(testData);
        setAuthor(userData);
        setTestResults(testResultsData);
      } catch (e: any) {
        console.error("Ошибка загрузки теста: ", e);
        navigate("/", { replace: true });
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [testId]);

  const handleClick = async () => {
    try {
      const testResultId = await startTest(testId);
      navigate(`results/${testResultId}`);
    } catch (e: any) {
      console.error(e);
      setOpen(true);
      setSeverity("error");
      if (e.response) {
        setMessage(e.response.statusText);
        console.log("e.response");
      } else if (e.request) {
        setMessage("Сервер не отвечает, повторите попытку позже");
      } else if (e.message) {
        setMessage(e.message);
        console.log("e.message");
      } else {
        setMessage("Произошла неизвестная ошибка");
      }
    }
  }

  const getCompletedCount = (testId: number) => {
    return testResults?.data.filter(r => r.testId === testId && r.endedAt).length ?? 0;
  };

  const getUnfinishedAttemptsCount = (testId: number) => {
    return testResults?.data.filter(r => r.testId === testId && !r.endedAt).length ?? 0;
  };

  const getAverageScore = (testId: number) => {
    const results = testResults?.data.filter(r => r.testId === testId && r.endedAt);
    if (!results || results.length === 0) return '—';
    const totalCorrect = results.reduce((sum, r) => sum + (r.score ?? 0), 0);
    return `${(totalCorrect / results.length)
      .toFixed(2)
      .replace(/\.00$/, '')
      .replace(/(\.\d)0$/, '$1')
      .replace('.', ',') + '%'}`;
  };

  return (
    <Page>
      <Header />
      {loading || !test ? (
        <ContentContainer>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        </ContentContainer>
      ) : (
        <ContentContainer gap={2}>
          <Box display="flex" justifyContent="space-between" gap={4}>
            <Typography variant="h4" sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
              {test.title}
            </Typography>
            {user && user.id === test.userId ? (
              <Button
                variant="outlined"
                fullWidth
                component={ReactDOM.Link}
                to="edit"
                sx={{ width: '10rem' }}
              >
                Изменить
              </Button>
            ) : null}
          </Box>
          {author && (
            <Typography variant="body2" color="text.secondary">
              {`${author.lastName} ${author.firstName} ${author.middleName || ''}`}
            </Typography>
          )}
          {test.description && (
            <Typography gutterBottom variant="body1" sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
              {test.description}
            </Typography>
          )}

          <Box display="flex" flexDirection="row" gap={6}>
            <Box
              display="flex"
              flexDirection="row"
              alignItems="center"
              gap={0.5}
              sx={{ minWidth: 100 }}
            >
              <Tooltip title="Заданий">
                <QuizOutlinedIcon fontSize="small" />
              </Tooltip>
              <Typography fontSize="1rem" variant="h6">{test.questions.length}</Typography>
            </Box>
            <Box
              display="flex"
              flexDirection="row"
              alignItems="center"
              gap={0.5}
              sx={{ minWidth: 100 }}
            >
              <Tooltip title="Пройдено">
                <TaskAltRoundedIcon fontSize="small" />
              </Tooltip>
              <Typography fontSize="1rem" variant="h6">{getCompletedCount(test.id)}</Typography>
            </Box>
            <Box
              display="flex"
              flexDirection="row"
              alignItems="center"
              gap={0.5}
              sx={{ minWidth: 100 }}
            >
              <Tooltip title="В процессе">
                <PendingActionsRoundedIcon fontSize="small" />
              </Tooltip>
              <Typography fontSize="1rem" variant="h6">{getUnfinishedAttemptsCount(test.id)}</Typography>
            </Box>
            <Box
              display="flex"
              flexDirection="row"
              alignItems="center"
              gap={0.5}
              sx={{ minWidth: 100 }}
            >
              <Tooltip title="Средняя успеваемость">
                <TrackChangesRoundedIcon fontSize="small" />
              </Tooltip>
              <Typography fontSize="1rem" variant="h6">{getAverageScore(test.id)}</Typography>
            </Box>
          </Box>

          <Box
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              p: 8,
              zIndex: 1000
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleClick}
              sx={{ width: '20rem' }}
            >
              Пройти тестирование
            </Button>
          </Box>
        </ContentContainer>
      )}
    </Page >
  );
}