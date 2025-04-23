import { Box, styled } from '@mui/material';
import { gray } from '@theme/themePrimitives';

const StyledEditorContainer = styled(Box)(({ theme }) => ({
  padding: '0 1rem',
  color: theme.palette.text.primary,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.default,
  transition: 'border 120ms ease-in',
  '&:hover': {
    borderColor: gray[400],
  },
  '& .tiptap:focus': {
    outline: 'none',
  },
  '& pre': {
    backgroundColor: '#2d2d2d',
    color: '#ffffff',
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
  },
}));

export default StyledEditorContainer;