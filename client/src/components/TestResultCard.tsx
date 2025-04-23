import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Dialog, DialogContent, DialogTitle, Grid2, List, ListItem, ListItemIcon, ListItemText, Tooltip, Typography } from '@mui/material';
import RepeatRoundedIcon from '@mui/icons-material/RepeatRounded';
import AccessAlarmRoundedIcon from '@mui/icons-material/AccessAlarmRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import SentimentDissatisfiedRoundedIcon from '@mui/icons-material/SentimentDissatisfiedRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';

import { gray } from '@theme/themePrimitives';
import { FillInTheBlankTask, MatchingTask, MultipleChoiceTask, QuestionForCreate, QuestionType, SingleChoiceTask, TestExtended, TestResultExtended, UserAnswer } from '@mytypes/testTypes';
import { calculateTimeTaken } from '@utils/calculateTimeTaken';
import { formatDate } from '@utils/dateUtils';
import StyledIconButton from './StyledIconButton';

type Props = {
  testResult: TestResultExtended;
  test?: TestExtended;
};

const TestResultCard: React.FC<Props> = ({ testResult, test }) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleOpenDialog = () => setIsDialogOpen(true);
  const handleCloseDialog = () => setIsDialogOpen(false);

  function formatAnswerSquares(test: TestExtended, testResult: TestResultExtended): string {
    const resultMap = new Map<number, boolean>();
    testResult.answers.forEach(res => {
      resultMap.set(res.questionId, res.isCompleted);
    });
    const sortedQuestions = [...test.questions].sort((a, b) => a.index - b.index);
    const squares = sortedQuestions.map((q) => {
      const isCorrect = resultMap.get(q.id);
      return isCorrect ? "🟩" : "🟥";
    });
    const lines: string[] = [];
    for (let i = 0; i < squares.length; i += 10) {
      lines.push(squares.slice(i, i + 10).join(''));
    }
    return `Результативность:\n${lines.join('\n')}`;
  }

  const chunkArray = <T,>(array: T[], chunkSize: number): T[][] => {
    const result: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize));
    }
    return result;
  };

  const answerChunks = chunkArray(testResult.answers, 10);

  function getFormattedAnswer(answer: UserAnswer, questions?: QuestionForCreate[]): string {
    if (!questions) return "Тест не найден";
    const question = questions.find((q) => q.id === answer.questionId);
    if (!question) return "Вопрос не найден";

    switch (answer.type) {
      case QuestionType.SingleChoice:
      case QuestionType.MultipleChoice: {
        const options = (question.task as SingleChoiceTask | MultipleChoiceTask).options;
        const userAnswer = (answer.task as SingleChoiceTask | MultipleChoiceTask).answer;
        const correctOptions = userAnswer
          .map((isSelected, index) => (isSelected ? options[index] : null))
          .filter(Boolean);
        return `Ответ: ${correctOptions.join(", ")}`;
      }
      case QuestionType.Matching: {
        const userAnswer = (answer.task as MatchingTask).answer;
        return `Ответ: ${userAnswer.map(([key, value]) => `${key} - ${value}`).join(", ")}`;
      }
      case QuestionType.FillInTheBlank: {
        const userAnswer = (answer.task as FillInTheBlankTask).answer;
        return `Ответ: ${userAnswer}`;
      }
    }
  }

  return (
    <Box
      display="flex"
      flexDirection="row"
      alignItems="center"
      sx={{
        border: `1px solid ${gray[200]}`,
        borderRadius: 1,
        padding: 2,
        backgroundColor: 'hsl(0, 0%, 99%)'
      }}
    >
      {test ? (
        <>
          <Box display="flex" flexDirection="column" gap={2} sx={{ flexGrow: 1 }}>
            <Typography variant="h6">
              <RouterLink to={`/tests/${test?.id}`} style={{ textDecoration: 'none', color: 'black' }}>
                {test.title}
              </RouterLink>
            </Typography>
            {testResult.endedAt ? (
              <Box display="flex" flexDirection="row">
                <Box display="flex" flexDirection="row" alignItems="center" gap={0.5} sx={{ minWidth: '6rem' }}>
                  <Tooltip title="Попытка">
                    <RepeatRoundedIcon fontSize="small" />
                  </Tooltip>
                  <Typography fontSize="1rem" variant="h6">{testResult.attempt}</Typography>
                </Box>
                <Box
                  display="flex"
                  flexDirection="row"
                  alignItems="center"
                  gap={0.5}
                  sx={{ minWidth: '6rem', cursor: 'pointer' }}
                  onClick={handleOpenDialog}
                >
                  <Tooltip title={<Box sx={{ whiteSpace: 'pre-line' }}>{formatAnswerSquares(test, testResult)}</Box>}>
                    <TrackChangesRoundedIcon fontSize="small" />
                  </Tooltip>
                  <Typography fontSize="1rem" variant="h6">
                    {(testResult.score ?? 0)
                      .toFixed(2).replace(/\.00$/, '')
                      .replace(/(\.\d)0$/, '$1')
                      .replace('.', ',') + '%'
                    }
                  </Typography>
                </Box>
                <Box display="flex" flexDirection="row" alignItems="center" gap={0.5}>
                  <Tooltip title={<Box sx={{ whiteSpace: 'pre-line' }}>{
                    "Время прохождения\nВремя начала: " + formatDate(testResult.startedAt) + "\nВремя завершения: " + formatDate(testResult.endedAt)
                  }</Box>}>
                    <AccessAlarmRoundedIcon fontSize="small" />
                  </Tooltip>
                  <Typography fontSize="1rem" variant="h6">{calculateTimeTaken(testResult.startedAt, testResult.endedAt)}</Typography>
                </Box>
              </Box>
            ) : (
              <Box display="flex" flexDirection="row" gap={2}>
                <Box display="flex" flexDirection="row" alignItems="center" gap={0.5} sx={{ minWidth: '6rem' }}>
                  <SentimentDissatisfiedRoundedIcon fontSize="small" />
                  <Typography fontSize="1rem" variant="h6">Тест не был завершен</Typography>
                </Box>
              </Box>
            )}
          </Box>

          {!testResult.endedAt ? (
            <Box>
              <RouterLink
                title="Закончить тест"
                to={`/tests/${test.id}/results/${testResult.id}`}
                style={{ textDecoration: 'none', color: 'black', borderRadius: '50%' }}
              >
                <StyledIconButton sx={{ borderRadius: '50%', color: 'black' }}>
                  <PlayCircleOutlineRoundedIcon />
                </StyledIconButton>
              </RouterLink>
            </Box>
          ) : null}
        </>
      ) : (
        <Typography>Тест не найден</Typography>
      )}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="lg">
        <DialogTitle>Ваши ответы</DialogTitle>
        <DialogContent>
          <Grid2 container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
            {answerChunks.map((chunk, columnIndex) => (
              <Grid2 key={columnIndex}>
                <List sx={{ p: 0 }}>
                  {chunk.map((answer, index) => (
                    <ListItem key={index} disablePadding>
                      <ListItemIcon sx={{ pr: 1 }}>
                        {answer.isCompleted ? (
                          <CheckCircleRoundedIcon style={{ color: 'green' }} />
                        ) : (
                          <CancelRoundedIcon style={{ color: 'red' }} />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={`Задание ${index + 1}`}
                        secondary={getFormattedAnswer(answer, test?.questions)}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid2>
            ))}
          </Grid2>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default TestResultCard;