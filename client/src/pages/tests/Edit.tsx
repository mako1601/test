import * as React from 'react';
import * as ReactDOM from 'react-router-dom';
import { Button, Box, FormControl, TextField, FormLabel, IconButton, RadioGroup, FormControlLabel, Radio, CircularProgress, Typography, Backdrop, Checkbox, Select, MenuItem, Collapse, Tooltip } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import Page from '@components/Page';
import Header from '@components/Header';
import PageCard from '@components/PageCard';
import DraggableGrid from '@components/DraggableGrid';
import StyledIconButton from '@components/StyledIconButton';
import ContentContainer from '@components/ContentContainer';
import { getTestById } from '@api/testApi';
import { useAuth } from '@context/AuthContext';
import { DESCRIPTION_MAX_LENGTH, QuestionForCreate, QuestionMap, questionTypes, Test, TestForSchemas, TITLE_MAX_LENGTH } from '@mytypes/testTypes';
import { useTestQuestions } from "@hooks/useTestQuestions";
import { SnackbarContext } from '@context/SnackbarContext';

// TODO: add question validation
export default function EditTest() {
  const { setSeverity, setMessage, setOpen } = React.useContext(SnackbarContext);
  const navigate = ReactDOM.useNavigate();
  const { id } = ReactDOM.useParams();
  const testId = Number(id);
  const { user, loading: userLoading } = useAuth();
  const [test, setTest] = React.useState<Test | null>(null);
  const [loading, setLoading] = React.useState(false);
  const initialImageUrls = React.useRef<string[]>([]);
  const localImages = React.useRef<Map<string, File>>(new Map());

  const {
    questions,
    activeQuestionId,
    setActiveQuestionId,
    addQuestion,
    setQuestions,
    updateQuestion,
    removeQuestion,
    reorderQuestionsOnDrag,
    addAnswerOption,
    updateAnswerOption,
    removeAnswerOption,
    setIsDirty,
    useEditTest,
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
  } = useTestQuestions();

  React.useEffect(() => {
    if (userLoading) return;
    if (!user) { navigate("/", { replace: true }); return; }
    if (isNaN(testId)) { navigate("/", { replace: true }); return; }

    const fetchTest = async () => {
      setLoading(true);
      try {
        const data = await getTestById(testId);
        setTest(data);
        if (Number(data.userId) !== Number(user.id)) {
          navigate("/", { replace: true });
          return;
        }
        setTitleLength(data.title.length);
        setDescriptionLength(data.description?.length ?? 0);
        const sortedQuestions = data.questions.sort((a, b) => a.index - b.index);

        const questionMap: QuestionMap = {};
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
    
          questionMap[crypto.randomUUID()] = q;
        }
    
        setQuestions(questionMap);
        setActiveQuestionId(Object.keys(questionMap)[0]);
      } catch (error) {
        console.error("Ошибка загрузки теста: ", error);
        navigate("/", { replace: true });
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [testId, user, userLoading]);

  React.useEffect(() => {
    if (test) {
      const imageUrls = Object.values(questions)
        .map(question => question.imageUrl)
        .filter((url): url is string => url !== undefined);;
      initialImageUrls.current = imageUrls;
      reset({
        title: test.title,
        description: test.description
      });
      setTitleLength(test.title.length);
      setDescriptionLength(test.description?.length ?? 0);
    }
  }, [test, reset]);

  const editTest = useEditTest();

  const onSubmit = async (data: TestForSchemas) => {
    setLoading(true);
    await editTest(test!.id, data, localImages, initialImageUrls);
    setLoading(false);
  }

  return (
    <Page>
      <Header />
      <ContentContainer gap="1rem">
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <PageCard sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* Title */}
            <FormControl>
              <FormLabel sx={{ display: 'flex', justifyContent: 'space-between' }}>
                Название теста
                <Box>{titleLength}/{TITLE_MAX_LENGTH}</Box>
              </FormLabel>
              <TextField
                {...register("title")}
                fullWidth
                error={!!errors.title}
                helperText={errors.title?.message}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.value.length > TITLE_MAX_LENGTH) {
                    target.value = target.value.slice(0, TITLE_MAX_LENGTH);
                  }
                }}
                onChange={(e) => {
                  setTitleLength(e.target.value.length);
                  setIsDirty(true);
                }}
              />
            </FormControl>

            {/* Description */}
            <FormControl>
              <FormLabel sx={{ display: 'flex', justifyContent: 'space-between' }}>
                Описание теста
                <Box>{descriptionLength}/{DESCRIPTION_MAX_LENGTH}</Box>
              </FormLabel>
              <TextField
                {...register("description")}
                fullWidth
                multiline
                error={!!errors.description}
                helperText={errors.description?.message}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.value.length > DESCRIPTION_MAX_LENGTH) {
                    target.value = target.value.slice(0, DESCRIPTION_MAX_LENGTH);
                  }
                }}
                onChange={(e) => {
                  setDescriptionLength(e.target.value.length);
                  setIsDirty(true);
                }}
              />
            </FormControl>
          </PageCard>

          {/* Draggable grid for questions */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography color='text.secondary'>Вопросы {Object.keys(questions).length}/50</Typography>
              <StyledIconButton onClick={() => setIsGridVisible(!isGridVisible)}>
                {isGridVisible ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </StyledIconButton>
            </Box>
            <Collapse in={isGridVisible} timeout="auto">
              <Box sx={{
                position: 'relative',
                overflow: 'visible',
                p: '2px',
                '& > *': {
                  overflow: 'visible'
                }
              }}>
                <DraggableGrid
                  questions={questions}
                  activeQuestionId={activeQuestionId}
                  setActiveQuestionId={setActiveQuestionId}
                  handleDragEnd={reorderQuestionsOnDrag}
                  addQuestion={addQuestion}
                  removeQuestion={removeQuestion}
                />
              </Box>
            </Collapse>
          </Box>

          {/* Question text and answer options */}
          <PageCard sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Question type selector */}
            <FormControl>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <FormLabel>Тип заданияа</FormLabel>
                <Tooltip
                  title={
                    <div>
                      <li><strong>Один правильный ответ:</strong> вопрос с вариантами ответов, один из которых является правильным</li>
                      <li><strong>Несколько правильных ответов:</strong> вопрос с вариантами ответов, несколько из которых являются правильными</li>
                      <li><strong>Соответствие:</strong> задание, в котором требуется установить правильное соответствие между элементами двух столбцов</li>
                      <li><strong>Заполнение пропущенного слова:</strong> утверждение с пропущенным словом, которое необходимо заполнить</li>
                    </div>
                  }
                  placement="right"
                >
                  <Box sx={{ color: 'text.secondary', cursor: 'pointer' }}>
                    <InfoOutlinedIcon fontSize='small' />
                  </Box>
                </Tooltip>
              </Box>
              <Box>
                <Select
                  value={questions[activeQuestionId].type}
                  onChange={(e) => {
                    updateQuestion(activeQuestionId, { type: Number(e.target.value) });
                    setIsDirty(true);
                  }}
                  sx={{
                    '& > div': {
                      padding: '0.5rem 1rem',
                      cursor: 'pointer'
                    },
                    p: 0,
                    cursor: 'pointer'
                  }}
                >
                  {questionTypes.map(type => (
                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                  ))}
                </Select>
              </Box>
            </FormControl>

            <FormControl sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Upload image button */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                {!questions[activeQuestionId].imageUrl ? (
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<ImageIcon />}
                    sx={{
                      color: 'text.secondary',
                      width: '600px',
                      height: '300px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      textAlign: 'center',
                      borderStyle: 'dashed',
                      borderWidth: 2,
                      borderColor: 'gray',
                      gap: 1,
                    }}
                  >
                    <Typography variant="h6" color="text.secondary">Загрузить изображение</Typography>
                    <Typography variant="body2" color="text.secondary">Рекомендуемое разрешение 600x300</Typography>
                    <Typography variant="body2" color="text.secondary">Максимальный размер 5МБ</Typography>
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const fileInput = e.target;
                        if (fileInput && fileInput.files) {
                          const file = fileInput.files[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              setOpen(true);
                              setSeverity("warning");
                              setMessage("Размер файла превышает 5 МБ. Пожалуйста, выберите файл меньшего размера");
                              return;
                            }
                            const localUrl = URL.createObjectURL(file);
                            localImages.current.set(localUrl, file);
                            updateQuestion(activeQuestionId, { imageUrl: localUrl });
                            setIsDirty(true);
                          }
                        }
                      }}
                    />
                  </Button>
                ) : (
                  <Box
                    sx={{
                      width: '600px',
                      height: '300px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'relative',
                      background: 'rgba(107, 107, 107, 0.25)',
                    }}
                  >
                    <img
                      src={questions[activeQuestionId].imageUrl}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }}
                    />
                    <IconButton
                      size="small"
                      title="Удалить изображение"
                      onClick={() => {
                        const imgUrl = questions[activeQuestionId].imageUrl;
                        if (imgUrl) {
                          localImages.current.delete(imgUrl);
                          URL.revokeObjectURL(imgUrl);
                        }
                        updateQuestion(activeQuestionId, { imageUrl: undefined });
                        setIsDirty(true);
                      }}
                      sx={{
                        position: 'absolute',
                        width: '1.5rem',
                        height: '1.5rem',
                        top: 8,
                        right: 8,
                        borderRadius: '20px',
                        backgroundColor: 'rgba(177, 177, 177, 0.7)',
                        '&:hover': {
                          backgroundColor: 'rgb(158, 158, 158)',
                        }
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>

              {/* Question text */}
              {questions[activeQuestionId].type !== 2 && (
                <TextField
                  fullWidth
                  value={questions[activeQuestionId].text ?? ""}
                  onChange={(e) => {
                    updateQuestion(activeQuestionId, { text: e.target.value });
                    setIsDirty(true);
                  }}
                  placeholder="Текст вопроса"
                />
              )}

              {/* Question types */}
              {/* Single Choice */}
              {questions[activeQuestionId].type === 0 && (
                <RadioGroup
                  sx={{ display: 'flex', gap: 2 }}
                  value={questions[activeQuestionId].task.answer.findIndex(ans => ans === true)}
                  onChange={(e) => {
                    const answerIndex = parseInt(e.target.value);
                    updateQuestion(activeQuestionId, {
                      task: {
                        answer: (questions[activeQuestionId].task.answer as boolean[]).map((_, idx) => idx === answerIndex ? true : false)
                      }
                    });
                    setIsDirty(true);
                  }}
                >
                  {questions[activeQuestionId].task.options.map((option, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        fullWidth
                        value={option}
                        onChange={(e) => {
                          updateAnswerOption(activeQuestionId, index, e.target.value);
                          setIsDirty(true);
                        }}
                        placeholder={`Вариант ответа ${index + 1}`}
                      />
                      <Box>
                        <FormControlLabel
                          sx={{ margin: 0 }}
                          value={index}
                          control={<Radio />}
                          label="Правильный"
                        />
                      </Box>
                      <IconButton
                        onClick={() => removeAnswerOption(activeQuestionId, index)}
                        disabled={questions[activeQuestionId].task.answer.length < 3}
                      >
                        <ClearRoundedIcon />
                      </IconButton>
                    </Box>
                  ))}
                </RadioGroup>
              )}

              {/* Multiple Choice */}
              {questions[activeQuestionId].type === 1 && (
                <>
                  {questions[activeQuestionId].task.options.map((option, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        fullWidth
                        value={option}
                        onChange={(e) => {
                          updateAnswerOption(activeQuestionId, index, e.target.value);
                          setIsDirty(true);
                        }}
                        placeholder={`Вариант ответа ${index + 1}`}
                      />
                      <FormControlLabel
                        control={<Checkbox
                          checked={questions[activeQuestionId].task.answer[index] as boolean}
                          onChange={(e) => {
                            const updatedAnswers = [...(questions[activeQuestionId].task.answer as boolean[])];
                            const trueCount = updatedAnswers.filter(val => val === true).length;

                            if (e.target.checked) {
                              if (trueCount < updatedAnswers.length) {
                                updatedAnswers[index] = true;
                              }
                            } else {
                              if (trueCount > 1) {
                                updatedAnswers[index] = false;
                              }
                            }

                            updateQuestion(activeQuestionId, { task: { answer: updatedAnswers } });
                            setIsDirty(true);
                          }}
                        />}
                        label="Правильный"
                      />
                      <IconButton
                        onClick={() => removeAnswerOption(activeQuestionId, index)}
                        disabled={questions[activeQuestionId].task.answer.length < 3}
                      >
                        <ClearRoundedIcon />
                      </IconButton>
                    </Box>
                  ))}
                </>
              )}

              {/* Matching */}
              {questions[activeQuestionId].type === 2 && (
                <>
                  {questions[activeQuestionId].task.answer.map((text, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        fullWidth
                        value={text[0]}
                        onChange={(e) => {
                          updateAnswerOption(activeQuestionId, index, e.target.value, 0);
                          setIsDirty(true);
                        }}
                        placeholder={`Элемент ${index + 1}`}
                      />
                      <TextField
                        fullWidth
                        value={text[1]}
                        onChange={(e) => {
                          updateAnswerOption(activeQuestionId, index, e.target.value, 1);
                          setIsDirty(true);
                        }}
                        placeholder="Соответствие"
                      />
                      <IconButton
                        onClick={() => removeAnswerOption(activeQuestionId, index)}
                        disabled={questions[activeQuestionId].task.answer.length < 3}
                      >
                        <ClearRoundedIcon />
                      </IconButton>
                    </Box>
                  ))}
                </>
              )}

              {/* Fill in the blank */}
              {questions[activeQuestionId].type === 3 && (
                <TextField
                  fullWidth
                  value={questions[activeQuestionId].task.answer}
                  onChange={(e) => {
                    updateQuestion(activeQuestionId, { task: { answer: e.target.value } });
                    setIsDirty(true);
                  }}
                  placeholder="Правильный ответ"
                />
              )}

              {(questions[activeQuestionId].type !== 3) && (
                <Button
                  variant="outlined"
                  startIcon={<AddRoundedIcon />}
                  onClick={() => {
                    addAnswerOption(activeQuestionId);
                    setIsDirty(true);
                  }}
                  sx={{
                    display: questions[activeQuestionId].type === 2
                      ? (questions[activeQuestionId].task.answer.length >= 5 ? 'none' : 'inline-flex')
                      : (questions[activeQuestionId].task.answer.length >= 4 ? 'none' : 'inline-flex')
                  }}
                >
                  Добавить вариант ответа
                </Button>
              )}
            </FormControl>
            <Button
              type="submit"
              sx={{ alignSelf: 'center', width: '10rem' }}
              variant={loading ? "outlined" : "contained"}
              disabled={loading}
            >
              {loading ? "Сохранение…" : "Сохранить"}
            </Button>
          </PageCard>
        </Box>
      </ContentContainer>
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
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Page >
  );
}