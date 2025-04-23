import * as ReactDOM from 'react-router-dom';
import { Box, Stack, Radio, Divider, IconButton, RadioGroup, Typography, FormControl, OutlinedInput, InputAdornment, FormControlLabel, CircularProgress } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import Page from '@components/Page';
import Header from '@components/Header';
import PageCard from '@components/PageCard';
import Pagination from '@components/Pagination';
import ArticleCard from '@components/ArticleCard';
import ContentContainer from '@components/ContentContainer';
import { getAllArticles } from '@api/articleApi';
import { useSearchAndPagination } from '@hooks/useSearchAndPagination';

const PAGE_SIZE = 10;

export default function ArticleList() {
  const navigate = ReactDOM.useNavigate();
  const {
    searchQuery,
    orderBy,
    sortDirection,
    data: articles,
    totalCount,
    currentPage,
    handleSearchChange,
    handleClearSearch,
    handleKeyDown,
    handlePageChange,
    handleOrderByChange,
    handleSortDirectionChange,
  } = useSearchAndPagination(getAllArticles, PAGE_SIZE);

  return (
    <Page>
      <Header />
      {!articles ? (
        <ContentContainer>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        </ContentContainer>
      ) : (
        <ContentContainer gap="1rem" sx={{ display: 'grid', gridTemplateColumns: '1fr auto' }}>
          <Stack gap="1rem">
            <Stack flexDirection="row" justifyContent="space-between">
              <Typography variant="h4">Список учебных материалов</Typography>
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
            {articles.length === 0 || currentPage > Math.ceil(totalCount / PAGE_SIZE) ? (
              <PageCard sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h5">Учебные материалы не нашлись :(</Typography>
              </PageCard>
            ) : (
              <Stack gap="1rem">
                <PageCard sx={{ padding: 0 }}>
                  {articles.map(article => (
                    <ArticleCard key={article.id} article={article} onClick={() => navigate(`${article.id}`)} />
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
    </Page >
  );
}