import { useNavigate } from 'react-router-dom';
import { Box, Button } from '@mui/material';

import PageCard from './PageCard';
import { useAuth } from '@context/AuthContext';

const ProfileNav = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Box display="flex" flexDirection="column" flex={1} gap={2}>
      <PageCard sx={{ p: '0.3rem' }}>
        <Box display="flex" flexDirection="column" gap='0.3rem'>
          <Button
            sx={{ justifyContent: "flex-start" }}
            onClick={() => navigate("/profile/data")}
            variant={location.pathname === "/profile/data" ? "outlined" : "text"}
          >
            Профиль
          </Button>
          {user?.role === 1 && (
            <>
              <Button
                sx={{ justifyContent: "flex-start" }}
                onClick={() => navigate("/profile/results")}
                variant={location.pathname === "/profile/results" ? "outlined" : "text"}
              >
                Мои результаты
              </Button>
            </>
          )}
          {user?.role === 2 && (
            <>
              <Button
                sx={{ justifyContent: "flex-start" }}
                onClick={() => navigate("/profile/articles")}
                variant={location.pathname === "/profile/articles" ? "outlined" : "text"}
              >
                Мои учебные материалы
              </Button>
              <Button
                sx={{ justifyContent: "flex-start" }}
                onClick={() => navigate("/profile/tests")}
                variant={location.pathname === "/profile/tests" ? "outlined" : "text"}
              >
                Мои тесты
              </Button>
            </>
          )}
        </Box>
      </PageCard >
    </Box >
  );
}

export default ProfileNav;