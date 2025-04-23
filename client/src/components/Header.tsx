import { Stack, Avatar, Button } from '@mui/material';

import HeaderMenu from '@components/HeaderMenu';
import CreateMenu from '@components/CreateMenu';
import HeaderInner from '@components/HeaderInner';
import HeaderContainer from '@components/HeaderContainer';
import { useAuth } from '@context/AuthContext';
import { Link } from 'react-router-dom';

export default function Header() {
  const { user } = useAuth();

  return (
    <HeaderContainer>
      <HeaderInner gridTemplateColumns="auto 1fr auto">

        {/* left */}
        <Stack direction="row" spacing={2}>
          <Button variant="text" component={Link} to="/">
            Главная
          </Button>
        </Stack>

        {/* middle */}
        <Stack direction="row" justifyContent="center" spacing={1}>
          <Button variant="text" component={Link} to="/articles?sortDirection=1">
            Учебные материалы
          </Button>
          <Button variant="text" component={Link} to="/tests?sortDirection=1">
            Тесты
          </Button>
          <Button variant="text" component={Link} to="/model">
            3D
          </Button>
        </Stack>

        {/* right */}
        {user ? (
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            {user.role === 2 && (<CreateMenu />)}
            <Link to="/profile/data" style={{ textDecoration: 'none' }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                {user.lastName ? user.lastName[0].toUpperCase() : "?"}
              </Avatar>
            </Link>
            <HeaderMenu />
          </Stack>
        ) : (
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button variant="contained" component={Link} to="/login">
              Войти
            </Button>
          </Stack>
        )}
      </HeaderInner>
    </HeaderContainer>
  );
}