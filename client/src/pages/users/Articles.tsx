import * as React from 'react';
import * as ReactDOM from 'react-router-dom';
import { Box, CircularProgress, Divider, FormControl, FormControlLabel, IconButton, InputAdornment, OutlinedInput, Radio, RadioGroup, Stack, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ClearIcon from '@mui/icons-material/Clear';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import Page from "@components/Page";
import Header from "@components/Header";
import ContentContainer from "@components/ContentContainer";
import PageCard from "@components/PageCard";
import Pagination from '@components/Pagination';
import { useAuth } from '@context/AuthContext';
import { gray } from '@theme/themePrimitives';
import { formatDate } from '@utils/dateUtils';
import { PageResult } from '@mytypes/commonTypes';
import StyledIconButton from '@components/StyledIconButton';
import { Article } from '@mytypes/articleTypes';
import { getAllArticles } from '@api/articleApi';

const PAGE_SIZE = 30;

export default function Articles() {
  const { user } = useAuth();

  const [searchParams, setSearchParams] = ReactDOM.useSearchParams();
  const [searchQuery, setSearchQuery] = React.useState(searchParams.get("searchText") || "");
  const searchText = searchParams.get("searchText") || "";
  const orderBy = (searchParams.get("orderBy") as "Title" | "CreatedAt" | "UpdatedAt") || "CreatedAt";
  const sortDirection = (searchParams.get("sortDirection") === "1" ? 1 : 0) as 0 | 1;
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const [articles, setArticles] = React.useState<PageResult<Article> | null>(null);

  const fetchTests = React.useCallback(async () => {
    try {
      const testsData = await getAllArticles({ userId: [user!.id], searchText, orderBy, sortDirection, currentPage, pageSize: PAGE_SIZE });
      setArticles(testsData);
    } catch (e) {
      setArticles(null);
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
              <Typography variant="h4">Ваши учебные материалы</Typography>
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
            {articles.data.length === 0 || currentPage > Math.ceil(articles.totalCount / PAGE_SIZE) ? (
              <PageCard sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h5">Учебные материалы не нашлись :(</Typography>
              </PageCard>
            ) : (
              <Stack gap={2}>
                <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={2}>
                  {articles.data.map(article => (
                    <Box
                      key={article.id}
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
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box sx={{ flex: 1, overflow: 'hidden' }}>
                          <Typography
                            sx={{
                              fontWeight: 'bold',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: '100%',
                            }}
                          >
                            <ReactDOM.Link to={`/articles/${article.id}`} style={{ textDecoration: 'none', color: 'black' }}>
                              {article.title}
                            </ReactDOM.Link>
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(article.createdAt)}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'center', paddingLeft: 2 }}>
                          <ReactDOM.Link title="Изменить" to={`/articles/${article.id}/edit`} style={{ borderRadius: '50%' }}>
                            <StyledIconButton
                              className="edit-button"
                              sx={{
                                position: 'relative',
                                borderRadius: '50%',
                                opacity: 0,
                                transition: 'opacity 0.2s ease-in-out',
                                zIndex: 1,
                              }}
                            >
                              <EditIcon />
                            </StyledIconButton>
                          </ReactDOM.Link>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
                <Pagination currentPage={currentPage} totalPages={Math.ceil(articles.totalCount / PAGE_SIZE)} onPageChange={handlePageChange} />
              </Stack>
            )}
          </Stack>
          <Stack>
            <PageCard sx={{ position: 'sticky', top: '1rem', padding: '0.3rem 1rem' }}>
              <FormControl>
                <RadioGroup value={orderBy} onChange={handleOrderByChange}>
                  <FormControlLabel value="Title" control={<Radio />} label="По названию" />
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