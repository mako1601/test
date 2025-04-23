import * as React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Link, Button, Divider, FormLabel, TextField, IconButton, Typography, FormControl, InputAdornment } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';

import SignCard from '@components/SignCard';
import Container from '@components/Container';
import { loginUser } from '@api/authApi';
import { getCurrentUser } from '@api/authApi';
import { useAuth } from '@context/AuthContext';
import { LogData } from '@mytypes/userTypes';
import { logSchema } from '@schemas/userSchemas';
import { SnackbarContext } from '@context/SnackbarContext';

export default function Login() {
  const { setSeverity, setMessage, setOpen } = React.useContext(SnackbarContext);
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LogData>({
    resolver: yupResolver(logSchema),
  });

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data: LogData) => {
    try {
      await loginUser(data);
      const user = await getCurrentUser();
      setUser(user);
      setSeverity("success");
      setMessage("Вход успешен!");
      setOpen(true);
      navigate("/");
    } catch (e: any) {
      console.error(e);
      if (e.response) {
        setSeverity("error");
        setMessage(e.response.data);
      } else if (e.request) {
        setSeverity("error");
        setMessage("Сервер не отвечает, повторите попытку позже");
      } else {
        setSeverity("error");
        setMessage("Произошла неизвестная ошибка");
      }
      setOpen(true);
    }
  };

  return (
    <Container direction="column" justifyContent="space-between">
      <SignCard variant="outlined">
        <FormControl sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <IconButton
            component={RouterLink}
            to="/"
            title="Вернуться на главную"
            style={{ border: 0, backgroundColor: 'transparent', paddingLeft: 0 }}
          >
            <KeyboardBackspaceIcon sx={{ fontSize: '2.15rem' }} />
          </IconButton>
          <Typography variant="h4" sx={{ width: '100%', fontSize: '2.15rem' }}>
            Вход
          </Typography>
        </FormControl>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <FormControl>
            <FormLabel>Логин</FormLabel>
            <TextField
              {...register("login")}
              fullWidth
              placeholder="user"
              autoComplete="login"
              error={!!errors.login}
              helperText={errors.login?.message}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Пароль</FormLabel>
            <TextField
              {...register("password")}
              fullWidth
              placeholder="••••••"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      title={showPassword ? "Спрятать пароль" : "Отобразить пароль"}
                      style={{ border: 0, backgroundColor: 'transparent' }}
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </FormControl>
          <Button type="submit" fullWidth variant="contained">Войти</Button>
        </Box>
        <Divider>
          <Typography sx={{ color: 'text.secondary' }}>или</Typography>
        </Divider>
        <Typography sx={{ textAlign: 'center' }}>
          У вас нет аккаунта?{' '}
          <Link component={RouterLink} to="/register" sx={{ alignSelf: 'center' }}>
            Зарегистрироваться
          </Link>
        </Typography>
      </SignCard>
    </Container>
  );
}