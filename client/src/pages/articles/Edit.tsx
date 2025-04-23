import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Box, FormControl, TextField, FormLabel, CircularProgress, Backdrop, IconButton } from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { EditorContent } from '@tiptap/react';

import Page from '@components/Page';
import Header from '@components/Header';
import PageCard from '@components/PageCard';
import BubbleMenu from '@components/BubbleMenu';
import ContentContainer from '@components/ContentContainer';
import StyledEditorContainer from '@components/StyledEditorContainer';
import { getArticleById } from '@api/articleApi';
import { useAuth } from '@context/AuthContext';
import { Article, ArticleForSchemas, CONTENT_MAX_LENGTH, DESCRIPTION_MAX_LENGTH, TITLE_MAX_LENGTH } from '@mytypes/articleTypes';
import { useArticleForm } from '@hooks/useArticles';

export default function EditArticle() {
  const navigate = useNavigate();
  const { id } = useParams();
  const articleId = Number(id);

  const { user, loading: userLoading } = useAuth();
  const [article, setArticle] = React.useState<Article | null>(null);
  const [loading, setLoading] = React.useState(true);
  const initialImageUrls = React.useRef<string[]>([]);
  const localImages = React.useRef<Map<string, File>>(new Map());
  const [canvas, setCanvas] = React.useState<HTMLCanvasElement | null>(null);
  const [canvasContainerRef, setCanvasContainerRef] = React.useState<HTMLDivElement | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    errors,
    reset,
    titleLength,
    setTitleLength,
    descriptionLength,
    setDescriptionLength,
    contentLength,
    setContentLength,
    setIsDirty,
    useArticleEditor,
    useEditArticle,
    useFetchJsonFromUrl,
    useUploadImages,
    extractImageUrls
  } = useArticleForm();

  const editor = useArticleEditor(setValue, setContentLength, setIsDirty);
  const uploadImages = useUploadImages(localImages);
  const editArticle = useEditArticle();

  React.useEffect(() => {
    if (userLoading) return;
    if (!user) { navigate("/", { replace: true }); return; }
    if (isNaN(articleId)) { navigate("/", { replace: true }); return; }

    const fetchArticle = async () => {
      setLoading(true);
      try {
        const data = await getArticleById(articleId);
        setArticle(data);
        if (Number(data.userId) !== Number(user.id)) {
          navigate("/", { replace: true });
          return;
        }
        setTitleLength(data.title.length);
        setDescriptionLength(data.description?.length ?? 0);
      } catch (error) {
        console.error("Ошибка загрузки статьи: ", error);
        navigate("/", { replace: true });
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [articleId, user, userLoading]);

  React.useEffect(() => {
    if (article && editor) {
      const fetchJson = async () => {
        const json = await useFetchJsonFromUrl(article.contentUrl);
        if (json) {
          editor.commands.setContent(json);
          setContentLength(editor.getText().length);
        }
      };

      fetchJson();
      initialImageUrls.current = extractImageUrls(editor.getHTML());
      setContentLength(editor.getText().length);
      reset({
        title: article.title,
        description: article.description,
        content: editor.getText()
      });
    }
  }, [article, reset, editor]);

  const onSubmit = async (data: ArticleForSchemas) => {
    setLoading(true);
    await editArticle(editor!, article!, data, uploadImages, initialImageUrls);
    setLoading(false);
  };

  React.useEffect(() => {
    (window as any).onCanvasGenerated = (generatedCanvas: HTMLCanvasElement) => {
      setCanvas(generatedCanvas);
    };
    return () => {
      delete (window as any).onCanvasGenerated;
    };
  }, []);

  React.useEffect(() => {
    if (canvas && canvasContainerRef) {
      canvasContainerRef.appendChild(canvas);
    }
  }, [canvas, canvasContainerRef]);

  const closeBackdrop = () => {
    if (canvasContainerRef && canvas) {
      canvasContainerRef.removeChild(canvas);
    }
    setCanvas(null);
  };

  const handleRunCode = React.useCallback(() => {
    if (editor) {
      editor.commands.executeCode();
    }
  }, [editor]);

  const getCursorPosition = () => {
    if (!editor) return { top: 0, left: 0 };
    const { anchor } = editor.state.selection;
    const coords = editor.view.coordsAtPos(anchor);
    const pageCard = document.querySelector('.page-card');
    if (!pageCard) return { top: coords.top, left: 0 };
    const pageCardRect = pageCard.getBoundingClientRect();
    return {
      top: coords.top,
      left: pageCardRect.right - 50
    };
  };

  const [cursorPos, setCursorPos] = React.useState({ top: 0, left: 0 });

  React.useEffect(() => {
    if (!editor) return;
    const updatePosition = () => {
      setCursorPos(getCursorPosition());
    };
    editor.on('selectionUpdate', updatePosition);
    return () => {
      editor.off('selectionUpdate', updatePosition);
    };
  }, [editor]);

  return (
    <Page>
      <Header />
      <ContentContainer gap="1rem">
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}
        >
          <PageCard sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl>
              <FormLabel sx={{ display: 'flex', justifyContent: 'space-between' }}>
                Название
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
            <FormControl>
              <FormLabel sx={{ display: 'flex', justifyContent: 'space-between' }}>
                Описание
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
          <PageCard className="page-card" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl>
              <FormLabel sx={{ display: 'flex', justifyContent: 'space-between' }}>
                Текст
                <Box>{contentLength}/{CONTENT_MAX_LENGTH}</Box>
              </FormLabel>
              {editor && <BubbleMenu editor={editor} localImages={localImages} />}
              <StyledEditorContainer>
                <EditorContent editor={editor} />
              </StyledEditorContainer>
              {errors.content && (
                <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.375, ml: 1.75, mr: 1.75 }}>
                  {errors.content.message}
                </Box>
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
            {editor && editor.isActive('codeRunner') && (
              <IconButton
                onClick={handleRunCode}
                sx={{
                  position: 'absolute',
                  top: `${cursorPos.top - 10}px`,
                  left: `${cursorPos.left - 20}px`,
                  padding: 0,
                  backgroundColor: 'transparent',
                  border: 'transparent',
                  transition: 'transform 0.2s ease, color 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    transform: 'scale(1.4)',
                    color: 'rgb(0, 200, 50)',
                  },
                }}
              >
                <PlayArrowRoundedIcon sx={{ color: 'rgb(12, 150, 0)', '&:hover': { color: 'rgb(0, 200, 50)' } }} />
              </IconButton>
            )}
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
        open={!!canvas}
        onClick={closeBackdrop}
      >
        {canvas && (
          <div
            style={{ display: 'flex', flexDirection: 'column' }}
            ref={el => setCanvasContainerRef(el)}
          />
        )}
      </Backdrop>
    </Page>
  );
}