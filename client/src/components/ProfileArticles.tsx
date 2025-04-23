import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, CircularProgress, Typography, Link } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

import PageCard from './PageCard';
import { getAllArticles } from '@api/articleApi';
import { useAuth } from '@context/AuthContext';
import { PageResult } from '@mytypes/commonTypes';
import { Article } from '@mytypes/articleTypes';
import { formatDate } from '@utils/dateUtils';
import StyledIconButton from './StyledIconButton';
import { gray } from '@theme/themePrimitives';

const ProfileArticles = () => {
  const { user } = useAuth();
  const [articles, setArticles] = React.useState<PageResult<Article> | null>(null);

  const fetchArticles = async () => {
    try {
      const data = await getAllArticles({ userId: [user!.id], orderBy: "CreatedAt", currentPage: 1, pageSize: 7, sortDirection: 1 });
      setArticles(data);
    } catch (e: any) {
      console.log(e);
    }
  };

  React.useEffect(() => {
    if (user !== null)
      fetchArticles();
  }, [user]);

  return (
    <PageCard sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: articles ? 'auto' : '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Недавно загруженные учебные материалы</Typography>
        <Link component={RouterLink} to="all?sortDirection=1">Показать все</Link>
      </Box>
      {articles ? (
        articles.data.length > 0 ? (
          <Box display="flex" flexDirection="column" gap={2}>
            {articles.data.map(article => (
              <Box
                key={article.id}
                display="flex"
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  border: `1px solid ${gray[200]}`,
                  borderRadius: 1,
                  padding: 2,
                }}
              >
                <Box display="grid" flexDirection="column" gap={1}>
                  <Typography variant="h6">
                    <RouterLink to={`/articles/${article.id}`} style={{ textDecoration: 'none', color: 'black' }}>
                      {article.title}
                    </RouterLink>
                  </Typography>
                  <Typography>{formatDate(article.createdAt)}</Typography>
                </Box>
                <RouterLink
                  title="Изменить"
                  to={`/articles/${article.id}/edit`}
                  style={{ textDecoration: 'none', color: 'black', borderRadius: '50%' }}
                >
                  <StyledIconButton sx={{ borderRadius: '50%', color: 'black' }}>
                    <EditIcon />
                  </StyledIconButton>
                </RouterLink>
              </Box>
            ))}
          </Box>
        ) : (
          <Box display="flex" alignItems="center" justifyContent="center" sx={{ height: '70vh' }}>
            <Typography fontWeight="bold" textAlign="center" color="text.secondary">
              У вас пока нет загруженных учебных материалов.
            </Typography>
          </Box>
        )
      ) : (
        <Box display="flex" alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
          <CircularProgress color="inherit" />
        </Box>
      )}
    </PageCard >
  );
}

export default ProfileArticles;