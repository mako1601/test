import { Box, styled } from '@mui/material';

import { gray } from '@theme/themePrimitives';

const HeaderContainer = styled(Box)(({ theme }) => ({
  zIndex: 3,
  width: '100%',
  minHeight: '56px',
  backgroundColor: 'hsl(0, 0%, 99%)',
  borderBottom: `1px solid ${theme.palette.divider}`,
  boxShadow: 'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ...theme.applyStyles('dark', {
    backgroundColor: gray[800],
    boxShadow: 'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

export default HeaderContainer;