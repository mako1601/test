import * as React from 'react';
import * as ReactDOM from 'react-router-dom';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { generateHTML } from '@tiptap/react';
import Image from '@tiptap/extension-image';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import DOMPurify from 'dompurify';

import Page from '@components/Page';
import Header from '@components/Header';
import PageCard from '@components/PageCard';
import CodeViewer from '@components/CodeViewer';
import { CodeRunner } from '@components/CodeRunner';
import ContentContainer from '@components/ContentContainer';
import { getArticleById } from '@api/articleApi';
import { getUserById } from '@api/userApi';
import { formatDate } from '@utils/dateUtils';
import { Article } from '@mytypes/articleTypes';
import { useAuth } from '@context/AuthContext';
import { useArticleForm } from '@hooks/useArticles';

export default function ViewArticle() {
  const { id } = ReactDOM.useParams();
  const articleId = Number(id);
  const { user } = useAuth();
  const [article, setArticle] = React.useState<Article | null>(null);
  const [author, setAuthor] = React.useState<{ lastName: string; firstName: string; middleName?: string } | null>(null);
  const [htmlContent, setHtmlContent] = React.useState<string | null>(null);
  const { useFetchJsonFromUrl } = useArticleForm();

  React.useEffect(() => {
    if (isNaN(articleId)) return;

    const fetchArticle = async () => {
      try {
        const data = await getArticleById(articleId);
        setArticle(data);

        if (data.userId) {
          const userData = await getUserById(data.userId);
          setAuthor(userData);
        }

        if (data.contentUrl) {
          const json = await useFetchJsonFromUrl(data.contentUrl);
          const html = generateHTML(json, [
            StarterKit,
            Underline,
            Image.extend({
              renderHTML({ HTMLAttributes }) {
                return ["img", { ...HTMLAttributes, style: "max-width: 100%; height: auto;" }];
              },
            }).configure({ inline: true }),
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            CodeRunner,
          ]);
          setHtmlContent(html);
        }
      } catch (e: any) {
        console.error("Ошибка загрузки статьи: ", e);
      }
    };
    fetchArticle();
  }, [articleId]);

  const renderContent = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const elements: React.ReactNode[] = [];

    doc.body.childNodes.forEach((node, index) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;

        if (element.tagName === "PRE" && element.getAttribute("data-type") === "code-runner") {
          const codeElement = element.querySelector("code");
          const codeText = codeElement?.textContent || "";

          elements.push(<CodeViewer key={index} code={codeText} />);
        } else {
          elements.push(
            <div
              key={index}
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(element.outerHTML) }}
            />
          );
        }
      }
    });

    return elements;
  };

  return (
    <Page>
      <Header />
      <ContentContainer>
        {(!article || !author || !htmlContent) ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        ) : (
          <PageCard sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h4" color="text.primary">
                {article.title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <Typography
                  sx={{ cursor: 'pointer' }}
                  color="text.primary"
                  onClick={() => author && console.log(`ID автора: ${article.userId}`)}
                >
                  {author ? `${author.lastName} ${author.firstName} ${author.middleName}` : "Загрузка…"}
                </Typography>
                <Typography variant="caption" color="text.primary">
                  {article.updatedAt ? "Обновлено" : "Создано"}: {article.updatedAt ? formatDate(article.updatedAt) : formatDate(article.createdAt)}
                </Typography>
                {user && user.id === article.userId ? (
                  <Button
                    variant="outlined"
                    fullWidth
                    component={ReactDOM.Link}
                    to="edit"
                    sx={{ margin: '1rem 0' }}
                  >
                    Изменить
                  </Button>
                ) : null}
              </Box>
            </Box>
            <Box>
              <div style={{ wordWrap: "break-word", overflowWrap: "break-word" }}>
                {htmlContent && renderContent(htmlContent)}
              </div>
            </Box>
          </PageCard>
        )}
      </ContentContainer>
    </Page>
  );
}