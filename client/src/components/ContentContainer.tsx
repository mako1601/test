import { Box, styled } from '@mui/material';

import { gray } from '@theme/themePrimitives';

const ContentContainer = styled(Box)(({ theme }) => ({
  marginBottom: 'auto',
  marginLeft: 'auto',
  marginRight: 'auto',
  width: '100%',
  maxWidth: '1200px',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  ...theme.applyStyles('dark', {
    backgroundColor: gray[800],
  }),
}));

export default ContentContainer;