import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { StyledEngineProvider } from '@mui/material/styles';
import router from './routes';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StyledEngineProvider injectFirst>
      <App>
        <RouterProvider
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          router={router}
        />
      </App>
    </StyledEngineProvider>
  </React.StrictMode>
);