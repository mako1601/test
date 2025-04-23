import * as React from 'react';
import { Alert, Snackbar, SnackbarCloseReason } from '@mui/material';

interface AppSnackbarProps {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
  onClose: (event?: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => void;
}

const alertStyles = {
  color: 'white',
  '& .MuiSvgIcon-fontSizeInherit': {
    color: 'white',
    height: '22px',
    width: '22px'
  },
  '& .MuiButtonBase-root': {
    width: '100%',
    height: '30px',
    margin: 0,
    padding: 0.625,
    color: 'white',
    border: 0,
    backgroundColor: 'transparent',
    ":hover": {
      borderRadius: '20px',
      background: 'rgba(var(--template-palette-action-activeChannel) / var(--template-palette-action-hoverOpacity))'
    }
  },
  '& .MuiSvgIcon-fontSizeSmall': {
    height: '20px',
    width: '20px'
  }
};

const AppSnackbar: React.FC<AppSnackbarProps> = ({ open, message, severity, onClose }) => {
  return (
    <Snackbar open={open} autoHideDuration={5000} onClose={onClose}>
      <Alert onClose={onClose} severity={severity} variant="filled" sx={{ ...alertStyles }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default AppSnackbar;