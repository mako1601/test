import { Box, CircularProgress, Divider, FormControl, FormControlLabel, IconButton, InputAdornment, OutlinedInput, Radio, RadioGroup, Stack, Typography } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import Page from '@components/Page';
import Header from '@components/Header';
import PageCard from '@components/PageCard';
import TestCard from '@components/TestCard';
import Pagination from '@components/Pagination';
import ContentContainer from '@components/ContentContainer';
import { getAllTests } from '@api/testApi';
import { useSearchAndPagination } from '@hooks/useSearchAndPagination';

const PAGE_SIZE = 10;

export default function TestList() {
  const {
    searchQuery,
    orderBy,
    sortDirection,
    data: tests,
    totalCount,
    currentPage,
    handleSearchChange,
    handleClearSearch,
    handleKeyDown,
    handlePageChange,
    handleOrderByChange,
    handleSortDirectionChange,
  } = useSearchAndPagination(getAllTests, PAGE_SIZE);

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
              <Typography variant="h4">Список тестов</Typography>
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
            {tests.length === 0 || currentPage > Math.ceil(totalCount / PAGE_SIZE) ? (
              <PageCard sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h5">Тесты не нашлись :(</Typography>
              </PageCard>
            ) : (
              <Stack gap="1rem">
                <PageCard sx={{ padding: 0 }}>
                  {tests.map((test) => (
                    <TestCard key={test.id} test={test} to={`${test.id}`} />
                  ))}
                </PageCard>
                <Pagination currentPage={currentPage} totalPages={Math.ceil(totalCount / PAGE_SIZE)} onPageChange={handlePageChange} />
              </Stack>
            )}
          </Stack>
          <Stack>
            <PageCard sx={{ position: 'sticky', top: '1rem', padding: '0.3rem 1rem' }}>
              <FormControl>
                <RadioGroup value={orderBy} onChange={handleOrderByChange}>
                  <FormControlLabel value="Title" control={<Radio />} label="По названию" />
                  <FormControlLabel value="UserId" control={<Radio />} label="По автору" />
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