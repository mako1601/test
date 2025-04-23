import * as React from 'react';
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Link, Button, Divider, FormLabel, TextField, IconButton, Typography, FormControl, InputAdornment } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';

import SignCard from '@components/SignCard';
import Container from '@components/Container';
import { registerUser } from '@api/authApi';
import { getCurrentUser } from '@api/authApi';
import { useAuth } from '@context/AuthContext';
import { regSchema } from '@schemas/userSchemas';
import { RegData } from '@mytypes/userTypes';
import { SnackbarContext } from '@context/SnackbarContext';

export default function Register() {
  const { setSeverity, setMessage, setOpen } = React.useContext(SnackbarContext);
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegData>({
    resolver: yupResolver(regSchema),
  });

  const onSubmit = async (data: RegData) => {
    try {
      await registerUser(data);
      const user = await getCurrentUser();
      setUser(user);
      setSeverity("success");
      setMessage("Регисатрация и вход успешены!");
      navigate("/");
    } catch (e: any) {
      console.error(e);
      setUser(null);
      setSeverity("error");
      if (e.response) {
        setMessage(e.response.data);
      } else if (e.request) {
        setMessage("Сервер не отвечает, повторите попытку позже");
      } else {
        setMessage("Произошла неизвестная ошибка");
      }
    }
    finally {
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
            Регистрация
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
                      onClick={() => setShowPassword(!showPassword)}
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
          <FormControl>
            <FormLabel>Фамилия</FormLabel>
            <TextField
              {...register("lastName")}
              fullWidth
              placeholder="Иванов"
              autoComplete="family-name"
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Имя</FormLabel>
            <TextField
              {...register("firstName")}
              fullWidth
              placeholder="Иван"
              autoComplete="given-name"
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Отчество</FormLabel>
            <TextField
              {...register("middleName")}
              fullWidth
              placeholder="Иванович (необязательно)"
              autoComplete="additional-name"
              error={!!errors.middleName}
              helperText={errors.middleName?.message}
            />
          </FormControl>
          <Button type="submit" fullWidth variant="contained">Зарегистрироваться</Button>
        </Box>
        <Divider>
          <Typography sx={{ color: 'text.secondary' }}>или</Typography>
        </Divider>
        <Typography sx={{ textAlign: 'center' }}>
          У вас уже есть аккаунт?{' '}
          <Link component={RouterLink} to="/login" sx={{ alignSelf: 'center' }}>
            Войти
          </Link>
        </Typography>
      </SignCard>
    </Container>
  );
}