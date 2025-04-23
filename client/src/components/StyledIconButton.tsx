import { IconButton, IconButtonProps, styled } from '@mui/material';
import { gray } from '@theme/themePrimitives';

const StyledIconButton = styled(IconButton)<IconButtonProps>(({ theme }) => ({
  color: theme.palette.text.secondary,
  border: 0,
  borderRadius: 7,
  backgroundColor: 'transparent',
  height: '2rem',
  width: '2rem',
  '& svg': {
    fontSize: 20,
  },
  '&:hover': {
    backgroundColor: gray[100],
    borderColor: gray[300],
  },
  '&:active': {
    backgroundColor: gray[200],
  },
  ...theme.applyStyles('dark', {
    backgroundColor: gray[800],
    borderColor: gray[700],
    '&:hover': {
      backgroundColor: gray[900],
      borderColor: gray[600],
    },
    '&:active': {
      backgroundColor: gray[900],
    },
  })
}));

export default StyledIconButton;