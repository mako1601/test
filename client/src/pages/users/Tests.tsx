import * as React from 'react';
import * as ReactDOM from 'react-router-dom';
import { Box, CircularProgress, Divider, FormControl, FormControlLabel, IconButton, InputAdornment, OutlinedInput, Radio, RadioGroup, Stack, Tooltip, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ClearIcon from '@mui/icons-material/Clear';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';

import Page from "@components/Page";
import Header from "@components/Header";
import ContentContainer from "@components/ContentContainer";
import PageCard from "@components/PageCard";
import Pagination from '@components/Pagination';
import { getAllTestResults, getAllTests } from '@api/testApi';
import { useAuth } from '@context/AuthContext';
import { Test, TestResult } from '@mytypes/testTypes';
import { gray } from '@theme/themePrimitives';
import { formatDate } from '@utils/dateUtils';
import { PageResult } from '@mytypes/commonTypes';
import StyledIconButton from '@components/StyledIconButton';

const PAGE_SIZE = 30;

export default function Tests() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = ReactDOM.useSearchParams();
  const [searchQuery, setSearchQuery] = React.useState(searchParams.get("searchText") || "");
  const searchText = searchParams.get("searchText") || "";
  const orderBy = (searchParams.get("orderBy") as "Title" | "QuestionCount" | "CompletedCount" | "UnfinishedCount" | "AverageScore" | "CreatedAt" | "UpdatedAt") || "CreatedAt";
  const sortDirection = (searchParams.get("sortDirection") === "1" ? 1 : 0) as 0 | 1;
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const [tests, setTests] = React.useState<PageResult<Test> | null>(null);
  const [testResults, setTestResults] = React.useState<PageResult<TestResult> | null>(null);

  const fetchTests = React.useCallback(async () => {
    try {
      const testsData = await getAllTests({ userId: [user!.id], searchText, orderBy, sortDirection, currentPage, pageSize: PAGE_SIZE });
      const testResultsData = await getAllTestResults({ testId: testsData.data.map(t => t.id) });
      setTests(testsData);
      setTestResults(testResultsData);
    } catch (e) {
      setTests(null);
      setTestResults(null);
    }
  }, [fetch, searchText, orderBy, sortDirection, currentPage]);

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    updateSearchParams({ searchText: "", page: 1 });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery !== searchText) {
      updateSearchParams({ searchText: searchQuery, page: 1 });
      e.currentTarget.blur();
    }
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
      {!tests ? (
        <ContentContainer>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        </ContentContainer>
      ) : (
        <ContentContainer gap="1rem" sx={{ display: 'grid', gridTemplateColumns: '1fr auto' }}>
          <Stack gap="1rem">
            <Stack flexDirection="row" justifyContent="space-between">
              <Typography variant="h4">Ваши тесты</Typography>
              <FormControl sx={{ minWidth: '10rem' }} variant="outlined">
                <OutlinedInput
                  sx={{ maxHeight: '2rem' }}
                  size="small"
                  placeholder="Поиск…"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                  startAdornment={
                    <InputAdornment position="start">
                      <SearchRoundedIcon fontSize="small" />
                    </InputAdornment>
                  }
                  endAdornment={
                    <InputAdornment position="end" sx={{ margin: 0 }}>
                      <IconButton edge="end" onClick={handleClearSearch} style={{ border: 0, backgroundColor: 'transparent' }}>
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </FormControl>
            </Stack>
            {tests.data.length === 0 || currentPage > Math.ceil(tests.totalCount / PAGE_SIZE) ? (
              <PageCard sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h5">Тесты не нашлись :(</Typography>
              </PageCard>
            ) : (
              <Stack gap={2}>
                <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={2} >
                  {tests.data.map((test) => (
                    <Box
                      key={test.id}
                      display="flex"
                      flexDirection="column"
                      gap={2}
                      sx={{
                        position: 'relative',
                        backgroundColor: 'white',
                        border: `1px solid ${gray[200]}`,
                        borderRadius: 1,
                        padding: 2,
                        overflow: 'hidden',
                        '&:hover .edit-button': {
                          opacity: 1
                        }
                      }}
                    >
                      <Box display="flex" flexDirection="row" justifyContent="space-between" sx={{ overflow: 'hidden' }}>
                        <Box sx={{ overflow: 'hidden' }}>
                          <Typography
                            sx={{
                              fontWeight: 'bold',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: '100%'
                            }}
                          >
                            <ReactDOM.Link to={`/tests/${test.id}`} style={{ textDecoration: 'none', color: 'black' }}>
                              {test.title}
                            </ReactDOM.Link>
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{formatDate(test.createdAt)}</Typography>
                        </Box>
                        <ReactDOM.Link title="Изменить" to={`/tests/${test.id}/edit`}>
                          <StyledIconButton className="edit-button"
                            sx={{
                              position: 'absolute',
                              bottom: '1rem',
                              right: '1rem',
                              borderRadius: '50%',
                              opacity: 0,
                              transition: 'opacity 0.2s ease-in-out',
                              zIndex: 1
                            }}>
                            <EditIcon />
                          </StyledIconButton>
                        </ReactDOM.Link>
                      </Box>
                      <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
                        <>
                          <Box
                            display="flex"
                            flexDirection="row"
                            alignItems="center"
                            gap={0.5}
                            sx={{ minWidth: 100 }}
                            color="text.secondary"
                          >
                            <Tooltip placement="left" title="Заданий">
                              <QuizOutlinedIcon fontSize="small" />
                            </Tooltip>
                            <Typography
                              sx={{ lineHeight: 1 }}
                              variant="caption"
                            >{test.questions.length}</Typography>
                          </Box>
                          <Box
                            display="flex"
                            flexDirection="row"
                            alignItems="center"
                            gap={0.5}
                            sx={{ minWidth: 100 }}
                            color="text.secondary"
                          >
                            <Tooltip placement="left" title="Пройдено">
                              <TaskAltRoundedIcon fontSize="small" />
                            </Tooltip>
                            <Typography
                              sx={{ lineHeight: 1 }}
                              variant="caption"
                            >{getCompletedCount(test.id)}</Typography>
                          </Box>
                        </>
                        <>
                          <Box
                            display="flex"
                            flexDirection="row"
                            alignItems="center"
                            gap={0.5}
                            sx={{ minWidth: 100 }}
                            color="text.secondary"
                          >
                            <Tooltip placement="left" title="В процессе">
                              <PendingActionsRoundedIcon fontSize="small" />
                            </Tooltip>
                            <Typography
                              sx={{ lineHeight: 1 }}
                              variant="caption"
                            >{getUnfinishedAttemptsCount(test.id)}</Typography>
                          </Box>
                          <Box
                            display="flex"
                            flexDirection="row"
                            alignItems="center"
                            gap={0.5}
                            sx={{ minWidth: 100 }}
                            color="text.secondary"
                          >
                            <Tooltip placement="left" title="Средняя успеваемость">
                              <TrackChangesRoundedIcon fontSize="small" />
                            </Tooltip>
                            <Typography
                              sx={{ lineHeight: 1 }}
                              variant="caption"
                            >{getAverageScore(test.id)}</Typography>
                          </Box>
                        </>
                      </Box>
                    </Box>
                  ))}
                </Box>
                <Pagination currentPage={currentPage} totalPages={Math.ceil(tests.totalCount / PAGE_SIZE)} onPageChange={handlePageChange} />
              </Stack>
            )}
          </Stack>
          <Stack>
            <PageCard sx={{ position: 'sticky', top: '1rem', padding: '0.3rem 1rem' }}>
              <FormControl>
                <RadioGroup value={orderBy} onChange={handleOrderByChange}>
                  <FormControlLabel value="Title" control={<Radio />} label="По названию" />
                  <FormControlLabel value="QuestionCount" control={<Radio />} label="По количеству вопросов" />
                  <FormControlLabel value="CompletedCount" control={<Radio />} label="По количеству завершенных" />
                  <FormControlLabel value="UnfinishedCount" control={<Radio />} label="По количеству незавершенных" />
                  <FormControlLabel value="AverageScore" control={<Radio />} label="По средней оценке" />
                  <FormControlLabel value="CreatedAt" control={<Radio />} label="По дате создания" />
                  <FormControlLabel value="UpdatedAt" control={<Radio />} label="По дате обновления" />
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