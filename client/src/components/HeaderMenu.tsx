import * as React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Divider, MenuItem, IconButton } from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';

import { logoutUser } from '@api/authApi';
import { useAuth } from "@context/AuthContext";

const HeaderMenu = () => {
  const { user, setUser } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    handleClose();
  };

  return (
    <div>
      <IconButton onClick={handleClick}>
        <MenuRoundedIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem component={Link} to="/profile/data" onClick={handleClose}>Профиль</MenuItem>
        {user?.role === 0 && (
          <MenuItem component={Link} to="/users" onClick={handleClose}>Пользователи</MenuItem>
        )}
        {user?.role === 1 && (
          <MenuItem component={Link} to="/profile/results" onClick={handleClose}>Мои результаты</MenuItem>
        )}
        {user?.role === 2 && (
          <>
            <MenuItem component={Link} to="/profile/articles" onClick={handleClose}>Мои учебные материалы</MenuItem>
            <MenuItem component={Link} to="/profile/tests" onClick={handleClose}>Мои тесты</MenuItem>
          </>
        )}
        <Divider />
        <MenuItem onClick={handleLogout}>Выйти</MenuItem>
      </Menu>
    </div>
  );
};

export default HeaderMenu;